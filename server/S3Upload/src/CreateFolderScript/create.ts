import fs from "fs";
const createFolder = async (folderName: string) => {
    try {
        fs.access(folderName, (error) => {

            // To check if given directory 
            // already exists or not
            if (error) {
                // If current directory does not exist then create it
                fs.mkdir(folderName, { recursive: true }, (error) => {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log("New Directory created successfully !!");
                    }
                });
            } else {
                console.log("Given Directory already exists !!");
            }
        });
    }
    catch (err) {
        console.log(err);
    }
}

createFolder("tmp/my-uploads")