/** 缓存条目 */
export interface SysCache {
  cacheName?: string;
  cacheKey?: string;
  cacheValue?: string;
  remark?: string;
}

/** 缓存命令统计 */
export interface CacheCommandStat {
  name: string;
  value: number | string;
}

/** Redis 基本信息 */
export interface CacheInfo {
  redis_version?: string;
  redis_mode?: string;
  tcp_port?: string;
  connected_clients?: string;
  uptime_in_days?: string;
  used_memory_human?: string;
  used_memory_peak_human?: string;
  used_cpu_user_children?: string;
  maxmemory_human?: string;
  aof_enabled?: string;
  rdb_last_bgsave_status?: string;
  instantaneous_input_kbps?: string;
  instantaneous_output_kbps?: string;
  [key: string]: string | undefined;
}

/** 缓存监控数据 */
export interface CacheMonitorData {
  info?: CacheInfo;
  commandStats?: CacheCommandStat[];
  dbSize?: number;
}
