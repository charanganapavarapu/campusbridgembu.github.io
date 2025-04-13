const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const rateLimit = require('express-rate-limit');

const execAsync = promisify(exec);

class CodeRunner {
    constructor() {
        this.tempDir = path.join(__dirname, '../../temp');
        this.maxExecutionTime = 5; // seconds
        this.maxMemoryUsage = '256m'; // 256MB
        this.maxFileSize = 1024 * 1024; // 1MB
        this.allowedLanguages = ['c', 'cpp', 'python', 'javascript'];
        
        // Create temp directory if it doesn't exist
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    // Rate limiter for code execution
    static getRateLimiter() {
        return rateLimit({
            windowMs: 60 * 1000, // 1 minute
            max: 10, // limit each IP to 10 requests per windowMs
            message: 'Too many code execution requests. Please try again later.'
        });
    }

    async runCode(code, language, input = '') {
        if (!this.allowedLanguages.includes(language)) {
            throw new Error('Unsupported programming language');
        }

        if (code.length > this.maxFileSize) {
            throw new Error('Code size exceeds maximum limit');
        }

        const timestamp = Date.now();
        const sourceFile = path.join(this.tempDir, `code_${timestamp}.${language}`);
        const executable = path.join(this.tempDir, `code_${timestamp}`);
        const inputFile = path.join(this.tempDir, `input_${timestamp}.txt`);
        const outputFile = path.join(this.tempDir, `output_${timestamp}.txt`);
        const errorFile = path.join(this.tempDir, `error_${timestamp}.txt`);

        try {
            // Write code to file
            fs.writeFileSync(sourceFile, code);

            // Write input to file if provided
            if (input) {
                fs.writeFileSync(inputFile, input);
            }

            // Compile and run based on language
            let result;
            switch (language) {
                case 'c':
                    result = await this.runCCode(sourceFile, executable, inputFile, outputFile, errorFile);
                    break;
                case 'cpp':
                    result = await this.runCppCode(sourceFile, executable, inputFile, outputFile, errorFile);
                    break;
                case 'python':
                    result = await this.runPythonCode(sourceFile, inputFile, outputFile, errorFile);
                    break;
                case 'javascript':
                    result = await this.runJavaScriptCode(sourceFile, outputFile, errorFile);
                    break;
                default:
                    throw new Error('Unsupported programming language');
            }

            return result;
        } catch (error) {
            return {
                success: false,
                output: null,
                error: error.message
            };
        } finally {
            // Cleanup
            this.cleanup([sourceFile, executable, inputFile, outputFile, errorFile]);
        }
    }

    async runCCode(sourceFile, executable, inputFile, outputFile, errorFile) {
        // Compile C code with security flags
        const compileCommand = `gcc ${sourceFile} -o ${executable} -Wall -Wextra -Werror -O2 -std=c11 -fstack-protector-strong`;
        const { stderr: compileError } = await execAsync(compileCommand);

        if (compileError) {
            throw new Error(`Compilation Error: ${compileError}`);
        }

        // Run the compiled program with timeout and resource limits
        const runCommand = inputFile 
            ? `timeout ${this.maxExecutionTime}s ${executable} < ${inputFile} > ${outputFile} 2> ${errorFile}`
            : `timeout ${this.maxExecutionTime}s ${executable} > ${outputFile} 2> ${errorFile}`;
        
        try {
            await execAsync(runCommand);
        } catch (error) {
            if (error.message.includes('timeout')) {
                throw new Error('Execution timed out. Your program took too long to run.');
            }
            throw error;
        }

        // Read output and error files
        const output = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
        const error = fs.existsSync(errorFile) ? fs.readFileSync(errorFile, 'utf8') : '';

        if (error) {
            throw new Error(`Runtime Error: ${error}`);
        }

        return {
            success: true,
            output: output || 'Program executed successfully with no output',
            error: null
        };
    }

    async runCppCode(sourceFile, executable, inputFile, outputFile, errorFile) {
        // Similar to C but with C++ specific flags
        const compileCommand = `g++ ${sourceFile} -o ${executable} -Wall -Wextra -Werror -O2 -std=c++17 -fstack-protector-strong`;
        const { stderr: compileError } = await execAsync(compileCommand);

        if (compileError) {
            throw new Error(`Compilation Error: ${compileError}`);
        }

        return this.runCCode(sourceFile, executable, inputFile, outputFile, errorFile);
    }

    async runPythonCode(sourceFile, inputFile, outputFile, errorFile) {
        const runCommand = inputFile
            ? `timeout ${this.maxExecutionTime}s python3 ${sourceFile} < ${inputFile} > ${outputFile} 2> ${errorFile}`
            : `timeout ${this.maxExecutionTime}s python3 ${sourceFile} > ${outputFile} 2> ${errorFile}`;

        try {
            await execAsync(runCommand);
        } catch (error) {
            if (error.message.includes('timeout')) {
                throw new Error('Execution timed out. Your program took too long to run.');
            }
            throw error;
        }

        const output = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
        const error = fs.existsSync(errorFile) ? fs.readFileSync(errorFile, 'utf8') : '';

        if (error) {
            throw new Error(`Runtime Error: ${error}`);
        }

        return {
            success: true,
            output: output || 'Program executed successfully with no output',
            error: null
        };
    }

    async runJavaScriptCode(sourceFile, outputFile, errorFile) {
        const runCommand = `timeout ${this.maxExecutionTime}s node ${sourceFile} > ${outputFile} 2> ${errorFile}`;

        try {
            await execAsync(runCommand);
        } catch (error) {
            if (error.message.includes('timeout')) {
                throw new Error('Execution timed out. Your program took too long to run.');
            }
            throw error;
        }

        const output = fs.existsSync(outputFile) ? fs.readFileSync(outputFile, 'utf8') : '';
        const error = fs.existsSync(errorFile) ? fs.readFileSync(errorFile, 'utf8') : '';

        if (error) {
            throw new Error(`Runtime Error: ${error}`);
        }

        return {
            success: true,
            output: output || 'Program executed successfully with no output',
            error: null
        };
    }

    cleanup(files) {
        files.forEach(file => {
            if (fs.existsSync(file)) {
                try {
                    fs.unlinkSync(file);
                } catch (error) {
                    console.error(`Error cleaning up file ${file}:`, error);
                }
            }
        });
    }
}

module.exports = CodeRunner; 