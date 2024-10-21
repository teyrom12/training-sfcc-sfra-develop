/* global process, __dirname */

const fse = require("fs-extra");
const glob = require("glob");
const path = require("path");
const chalk = require("chalk");
const minimatch = require("minimatch");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const autoprefixer = require("autoprefixer");
const pkg = require("./package.json");

class MiniCssExtractPluginCleanup {
    apply(compiler) {
        compiler.hooks.compilation.tap("MiniCssExtractPluginCleanup", (compilation) => {
            compilation.hooks.afterProcessAssets.tap("MiniCssExtractPluginCleanup", () => {
                Object.keys(compilation.assets)
                    .filter((asset) => {
                        return ["*/css/**/*.js", "*/css/**/*.js.map"].some((pattern) => {
                            return minimatch(asset, pattern);
                        });
                    })
                    .forEach((asset) => {
                        delete compilation.assets[asset];
                    });
            });
        });
    }
}

function getJSBundle(env, cartridge) {
    const clientPath = path.resolve(__dirname, "cartridges", cartridge, "cartridge", "client", "default", "js").replace(/\\/g, "/");
    
    // Check if the client path exists
    if (!fse.existsSync(clientPath)) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} clientPath=${clientPath} does not exist!`);
        process.exit(1);
    }

    // Use a glob pattern to find JS files
    const globPattern = path.join(clientPath, "**", "*.js").replace(/\\/g, "/");
    const matchedFiles = glob.sync(globPattern);

    //console.log("Glob pattern used:", globPattern);
    //console.log("Matched JS files:", matchedFiles);

    const bundle = {
        mode: env.production ? "production" : "development",
        devtool: env.production ? false : "source-map", // Enable source maps in development
        entry: {},
        output: {
            path: path.resolve(__dirname, "cartridges", cartridge, "cartridge/static", "js"), // Ensure output path is correct
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    use: [
                        {
                            loader: "babel-loader",
                            options: {
                                compact: false,
                                babelrc: false,
                                cacheDirectory: true,
                                presets: ["@babel/preset-env"],
                                plugins: ["@babel/plugin-proposal-object-rest-spread"],
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "cartridges", cartridge, "cartridge/static/js/*")],
                cleanAfterEveryBuildPatterns: [],
            }),
        ],
        optimization: {
            minimizer: [new TerserPlugin()],
        },
    };

    // Populate the entry object with matched files
    matchedFiles.forEach((file) => {
        const key = path.relative(clientPath, file).replace(/\.js$/, ""); // Use relative path for keys
        bundle.entry[key] = file;
    });

    if (Object.keys(bundle.entry).length === 0) {
        console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No JS files to compile for cartridge=${cartridge}!`);
        return; // Return early if there are no files
    }

    // Handle alias if defined in package.json
    if (pkg.aliasJS) {
        const alias = {};
        Object.entries(pkg.aliasJS).forEach(([key, value]) => {
            alias[key] = path.resolve(__dirname, value);
        });

        bundle.resolve = { alias };
    }

    return bundle;
}

function getCSSBundle(env, cartridge) {
    const clientPath = path.resolve(__dirname, "cartridges", cartridge, "cartridge", "client", "default", "scss").replace(/\\/g, "/");
    
    // Check if the client path exists
    if (!fse.existsSync(clientPath)) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} clientPath=${clientPath} does not exist!`);
        process.exit(1);
    }

    // Use a glob pattern to find SCSS files
    const globPattern = path.join(clientPath, "**", "*.scss").replace(/\\/g, "/");
    const matchedFiles = glob.sync(globPattern);

    const bundle = {
        mode: env.production ? "production" : "development",
        devtool: env.production ? false : 'source-map', // Enable source maps in development mode
        entry: {},
        output: {
            path: path.resolve(__dirname, "cartridges", cartridge, "cartridge/static", "css"), // Ensure output path is correct
            filename: "[name].js",
        },
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader", options: { url: false } },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [autoprefixer],
                                },
                            },
                        },
                        "sass-loader",
                    ],
                },
                {
                    test: /\.css$/i,
                    use: [
                        MiniCssExtractPlugin.loader,
                        { loader: "css-loader", options: { url: false } },
                        {
                            loader: "postcss-loader",
                            options: {
                                postcssOptions: {
                                    plugins: [autoprefixer],
                                },
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new CleanWebpackPlugin({
                cleanOnceBeforeBuildPatterns: [path.resolve(__dirname, "cartridges", cartridge, "cartridge/static/css/*")],
            }),
            new MiniCssExtractPlugin(),
            (cartridge === "bm_smartorderrefill") ? new CopyPlugin({
                patterns: [
                    {
                        from: path.resolve(__dirname, "cartridges", cartridge, "cartridge", "client", "default", "lib", "css"),
                        to: path.resolve(__dirname, "cartridges", cartridge, "cartridge", "static", "default", "css")
                    }
                ]
            }) : null
        ].filter(Boolean),
        optimization: {
            minimizer: [
                new CssMinimizerPlugin({
                    minimizerOptions: {
                        preset: [
                            "default",
                            {
                                discardComments: { removeAll: true },
                            },
                        ],
                    },
                }),
            ],
        },
    };

    // Populate the entry object with matched files
    matchedFiles.forEach((file) => {
        const key = path.relative(clientPath, file).replace(/\.scss$/, ""); // Use relative path for keys
        bundle.entry[key] = file;
    });

    if (Object.keys(bundle.entry).length === 0) {
        console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No SCSS files to compile for cartridge=${cartridge}!`);
        return; // Return early if there are no files
    }

    // Handle alias if defined in package.json
    if (pkg.aliasCSS) {
        const alias = {};
        Object.entries(pkg.aliasCSS).forEach(([key, value]) => {
            alias[key] = path.resolve(__dirname, value);
        });
        bundle.resolve = { alias };
    }

    return bundle;
}


module.exports = (env, _argv) => {
    // Check if the cartridges entry exists in package.json
    if (!pkg.cartridges || !Array.isArray(pkg.cartridges)) {
        console.error(`${chalk.red.bold("[ERROR] \u2716")} package.json does not contain a valid "cartridges" entry!`);
        process.exit(1);
    }

    // Create configurations for JS and CSS bundles
    const configurations = pkg.cartridges.flatMap((cartridge) => {
        console.log(`Processing cartridge: ${cartridge}`);

        // Get JS bundle
        const jsBundle = getJSBundle(env, cartridge);
        if (jsBundle) {
            console.log(`JS bundle created for cartridge: ${cartridge}`);
        } else {
            console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No JS bundle created for cartridge: ${cartridge}`);
        }

        // Get CSS bundle
        const cssBundle = getCSSBundle(env, cartridge);
        if (cssBundle) {
            console.log(`CSS bundle created for cartridge: ${cartridge}`);
        } else {
            console.warn(`${chalk.yellow.bold("[WARNING] \u2716")} No CSS bundle created for cartridge: ${cartridge}`);
        }

        return [jsBundle, cssBundle].filter(Boolean); // Return only defined bundles
    });

    return configurations;
};