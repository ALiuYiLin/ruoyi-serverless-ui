import type { PageDomain } from "../common";

/** 服务监控 CPU 信息 */
export interface ServerCpu {
  cpuNum?: number;
  total?: number;
  used?: number;
  sys?: number;
  free?: number;
  wait?: number;
}

/** 服务监控内存信息 */
export interface ServerMem {
  total?: number;
  used?: number;
  free?: number;
  usage?: number;
}

/** 服务监控 JVM 信息 */
export interface ServerJvm {
  name?: string;
  version?: string;
  startTime?: string;
  runTime?: string;
  home?: string;
  inputArgs?: string;
  total?: number;
  used?: number;
  free?: number;
  max?: number;
  usage?: number;
}

/** 服务监控服务器信息 */
export interface ServerSys {
  computerName?: string;
  computerIp?: string;
  osName?: string;
  osArch?: string;
  userDir?: string;
}

/** 服务监控磁盘信息 */
export interface ServerSysFile {
  dirName?: string;
  sysTypeName?: string;
  typeName?: string;
  total?: string;
  free?: string;
  used?: string;
  usage?: number;
}

/** 服务监控完整信息 */
export interface ServerInfo {
  cpu?: ServerCpu;
  mem?: ServerMem;
  jvm?: ServerJvm;
  sys?: ServerSys;
  sysFiles?: ServerSysFile[];
}

/** 服务监控查询参数（当前无参数，保留类型扩展） */
export type ServerQueryParams = PageDomain;
