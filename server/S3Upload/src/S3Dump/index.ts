import "dotenv/config";
import * as AWS from "aws-sdk";

export class S3 {
  private static s3: AWS.S3 | null = null;
  constructor() {}

  public static getInstance(): AWS.S3 | null {
    if (this.s3) {
      return this.s3;
    } else {
      this.s3 = new AWS.S3({ apiVersion: "2006-03-01" });
      return this.s3;
    }
  }
}
