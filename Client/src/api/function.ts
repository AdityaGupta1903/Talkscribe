import axios from "axios";
import { PROD_URL } from "../../contants";
export class Controller {
    public static async isUserAuthenticated() {
        try {
            let res = await axios.get(`${PROD_URL}/loggedin`, {
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
            let res = await axios.get(`${PROD_URL}/getUserId`, {
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
            let res = await axios.get(`${PROD_URL}/getRecordings`, {
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
    public static async deleteRecording(Id: number, PublicUrl: string) {
        try {
            let RecordingDetails = {
                Id: Id,
                PublicUrl: PublicUrl
            }
            let resp = await axios.post(`${PROD_URL}/deleteRecording`, RecordingDetails, {
                withCredentials: true,
            });
            console.log(resp);
        }
        catch (err) {
            console.log(err);
            return false;
        }
    }

}