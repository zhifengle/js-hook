import fs from 'fs';
import path from 'path';
import os from 'os';

const ONE_DAY = 24 * 60 * 60 * 1000;
const REVALIDATE_INTERVAL = ONE_DAY * 7;
// const REVALIDATE_INTERVAL = 1000 * 60;

export function sanitizePath(path: string): string {
  return path
    .replace(/\\/g, '%5C')
    .replace(/\//g, '%2F')
    .replace(/:/g, '%3A')
    .replace(/\*/g, '%2A')
    .replace(/\?/g, '%3F')
    .replace(/"/g, '%22')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/\|/g, '%7C');
}

export function getHomePath(): string {
  const name = 'js-hook-cache';
  const homedir = os.homedir();
  return path.join(homedir, '.cache', name);
}

export function removeFile(url: string): Promise<void> {
  const targetFile = getFilePath(url);
  if (!fs.existsSync(targetFile)) {
    return;
  }
  return fs.promises.unlink(targetFile);
}

export function getFilePath(url: string): string {
  const urlObj = new URL(url);
  // @TODO 路径可能有 Windows 下面的非法字符
  // pathname.split('/').map(xxx).join('/');  映射转码后再拼接
  return path.join(
    getHomePath(),
    encodeURIComponent(urlObj.host),
    urlObj.pathname
  );
}

// buffer ?
// js 的 string 创建后不可修改?
export async function cacheFile(url: string, data: string): Promise<void> {
  const targetFile = getFilePath(url);
  const targetDir = path.dirname(targetFile);
  if (!fs.existsSync(targetDir)) {
    await fs.promises.mkdir(targetDir, { recursive: true });
  }
  await fs.promises.writeFile(targetFile, data);
}

export function getCachedFile(url: string): Buffer {
  const targetFile = getFilePath(url);
  if (!fs.existsSync(targetFile)) {
    throw new Error('no cached');
  }
  return fs.readFileSync(targetFile);
}

export function hasValidCache(url: string): boolean {
  const filePath = getFilePath(url);
  let result = fs.existsSync(filePath);

  // if (result) {
  //   const stats = fs.statSync(filePath);
  //   if (
  //     new Date().getTime() - new Date(stats.mtime).getTime() >
  //     REVALIDATE_INTERVAL
  //   ) {
  //     return false;
  //   }
  // }
  return result;
}

// 判断是否存在
// console.log(fs.existsSync(path.join(__dirname, '../')));

// fs.mkdirSync('./test/11', { recursive: true });
