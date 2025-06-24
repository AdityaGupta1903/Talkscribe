"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.post("/upload", express_1.default.raw({ type: "*/*" }), (req, res) => {
    try {
        const data = req.body;
        console.log(data);
        res.status(200).send({ "data-received": data });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ err: err });
    }
});
app.listen(3000, () => {
    console.log("Server is Running on Port" + " " + 3000);
});
