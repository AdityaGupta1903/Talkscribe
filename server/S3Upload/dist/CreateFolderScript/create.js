"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const createFolder = (folderName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        fs_1.default.access(folderName, (error) => {
            // To check if given directory 
            // already exists or not
            if (error) {
                // If current directory does not exist then create it
                fs_1.default.mkdir(folderName, { recursive: true }, (error) => {
                    if (error) {
                        console.log(error);
                    }
                    else {
                        console.log("New Directory created successfully !!");
                    }
                });
            }
            else {
                console.log("Given Directory already exists !!");
            }
        });
    }
    catch (err) {
        console.log(err);
    }
});
createFolder("tmp/my-uploads");
