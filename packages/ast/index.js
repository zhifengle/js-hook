"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.inject = void 0;
const core_1 = require("@swc/core");
const path_1 = require("path");
function inject(code, genOpt) {
    const output = (0, core_1.transformSync)(code, {
        minify: true,
        jsc: {
            experimental: {
                plugins: [
                    [
                        (0, path_1.join)(__dirname, './my-first-plugin/my_first_plugin.wasm'),
                        {
                            hookCallName: 'e_user_hook',
                        },
                    ],
                ],
            },
        },
    });
    return output.code;
}
exports.inject = inject;
