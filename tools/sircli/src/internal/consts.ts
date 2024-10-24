import { platform } from 'node:os'

// Recursive flag my differ according to platfom
export const RECURSIVE_FLAG = platform() === 'win32' ? 'R' : 'r'
