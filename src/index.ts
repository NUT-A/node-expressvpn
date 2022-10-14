import { exec } from "child_process"
import { platform } from 'node:process';
import path from "path";

async function execAsync(command: string) {
    return new Promise<string>((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(stderr)
                reject(error)
            } else {
                resolve(stdout)
            }
        });
    })
}

export class ExpressVPN {
    private readonly logger: (text: string) => void

    constructor(logger: (text: string) => void) {
        this.logger = logger
    }

    private getLogLastLine(stdout: string) {
        return stdout.trim().split(/\r?\n/).pop() || ""
    }

    private getCommand(subcommand: string) {
        const rootPath = path.resolve(__dirname, "../bin")

        if (platform == "win32") {
            return `${rootPath}\\expresso.exe ${subcommand}`
        } else {
            return `${rootPath}/expresso ${subcommand}`
        }
    }

    async connect() {
        const result = await execAsync(this.getCommand("connect"))
        this.logger(this.getLogLastLine(result))
    }
    
    async disconnect() {
        const result = await execAsync(this.getCommand("disconnect"))
        this.logger(this.getLogLastLine(result))
    }
}