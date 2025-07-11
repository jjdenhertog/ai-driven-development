// import { mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from "node:fs";
// import { join } from "node:path";

// export function ensureDir(path: string): void {
//     if (!existsSync(path)) {
//         mkdirSync(path, { recursive: true });
//     }
// }

// export function copyRecursive(src: string, dest: string): void {
//     if (!existsSync(src)) {
//         return;
//     }

//     const stats = statSync(src);

//     if (stats.isDirectory()) {
//         ensureDir(dest);
//         const entries = readdirSync(src);

//         for (const entry of entries) {
//             const srcPath = join(src, entry);
//             const destPath = join(dest, entry);
//             copyRecursive(srcPath, destPath);
//         }
//     } else {
//         copyFileSync(src, dest);
//     }
// }

// export async function getCompletedTasks(targetRoot: string): Promise<string[]> {
//     const completedDir = join(targetRoot, 'ai-dev', 'tasks', 'completed');
    
//     try {
//         const files = readdirSync(completedDir);

//         return files.filter(f => f.endsWith('.md'));
//     } catch {
//         return [];
//     }
// }