import { exec } from "child_process"
import { platform } from 'node:process';
import path from "path";

const isReachable = require('is-reachable');

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

    private async isOnline() {
        return await isReachable('https://google.com');
    }

    private async waitForInternetConnection() {
        this.logger("Waiting for internet connection...")
        var attempts = 0

        while (!(await this.isOnline()) && attempts < 10) {
            await new Promise(resolve => setTimeout(resolve, 1000))
            attempts++
        }

        if (attempts >= 10) {
            throw new Error("Unable to connect to internet")
        }

        this.logger("Internet connection established")
    }

    async connect() {
        const connected = await this.isConnected()
        if (connected) {
            return
        }

        const result = await execAsync(this.getCommand("connect"))
        this.logger(this.getLogLastLine(result))

        await this.waitForInternetConnection()
    }
    
    async disconnect() {
        const connected = await this.isConnected()
        if (!connected) {
            return
        }

        const result = await execAsync(this.getCommand("disconnect"))
        this.logger(this.getLogLastLine(result))
    }

    async isConnected() {
        const status = await this.status()
        return !status.includes("VPN not connected")
    }

    async status() {
        return await execAsync(this.getCommand("status"))
    }
}