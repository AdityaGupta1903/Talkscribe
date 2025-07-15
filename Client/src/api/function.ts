import axios from "axios";
export class Controller {
    public static async isUserAuthenticated() {
        try {
            let res = await axios.get("https://talkscribeaptapiv1.adityagupta.site/loggedin", {
                withCredentials: true
            })
            console.log(res.data);
            return res.data.authenticated;
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }
    public static async getUserId() {
        try {
            let res = await axios.get("https://talkscribeaptapiv1.adityagupta.site/getUserId", {
                withCredentials: true
            });
            return res.data.UID as string;
        }
        catch (err) {
            console.log(err);
            let UID = document.cookie?.split(";")[2]?.split("=")[1];
            return UID
        }
    }
    public static async getRecordings() {
        try {
            let res = await axios.get("https://talkscribeaptapiv1.adityagupta.site/getRecordings", {
                withCredentials: true
            })
            console.log(res);
            return res.data;
        }
        catch (err) {
            console.log(err);
            return [];
        }
    }
}