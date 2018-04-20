import { S3, AWSError } from 'aws-sdk';
import { ListObjectsV2Output, Object, PutObjectOutput } from 'aws-sdk/clients/s3';

export class S3Opts {
    /**
     * Checks whether the object has a new version
     * @param bucketName 
     * @param objectKey 
     * @param providedEtag 
     */
    public static async hasNew(bucketName: string, objectKey: string, providedEtag: string): Promise<boolean> {
        console.log(`Checking ETag for stim bucket ${bucketName} for ${objectKey} and ${providedEtag} `);
        return new Promise<boolean>((res, rej) => {
           
            const s3 = new S3();
            s3.headObject({
                Bucket: bucketName,
                Key: objectKey
            }, (err: AWSError, data: S3.Types.HeadObjectOutput) => {
                if(err) {
                    rej(err);
                    return;
                }
                res(JSON.parse(data.ETag) !== providedEtag); // ETAGs are json strings
            });
        });
    }

    /**
     * Creates the version json
     * @param bucketName 
     */
    public static async createETagJson(bucketName: string) {
        console.log(`Creating ETagJson for stim bucket ${bucketName}`);
        return new Promise<boolean>((res, rej) => {
            const s3 = new S3();
            s3.listObjectsV2({
                Bucket: bucketName,
                //Delimiter: ".zip"
            }, (err: AWSError, data: ListObjectsV2Output) => {
                if (err) {
                    rej(err);
                    return;
                }
                console.log('Got bucket tars', JSON.stringify(data.Contents, null, 5));
                const list: Object[] = data.Contents as Object[];
                const json = {};
                list.filter(it => { 
                    const key: string = it.Key  as string;
                    return key.endsWith(".tar");
                }).forEach (it => {
                    const key: string = it.Key  as string;
                    json[key.split(".tar")[0]] = JSON.parse(it.ETag || "\"-1\"");
                });
                console.log(`Got ETAg jsons as ` , JSON.stringify(json, null, 5));
                s3.putObject({
                    Bucket: bucketName,
                    Key: 'versions.json',
                    ContentType: 'application/json',
                    Body: JSON.stringify(json, null, 5)
                }, (err: AWSError, data: PutObjectOutput) => {
                    if(err) {
                        rej(err);
                        return;
                    }
                    res(true);
                });                
            });
        });
        
        
    }
}