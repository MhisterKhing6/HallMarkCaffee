import {readFile} from "node:fs"
import { promisify } from "node:util"

let readFileAsync = promisify(readFile);

(async () => {
    let resposne = await readFileAsync("./c.png")
    console.log(resposne.toString("base64"))
})()