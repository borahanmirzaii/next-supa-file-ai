-- Performance optimization indexes

-- Files table indexes
create index if not exists files_user_id_created_at_idx 
  on public.files(user_id, created_at desc);

create index if not exists files_status_idx 
  on public.files(status) 
  where status in ('pending', 'processing');

-- Analysis table indexes
create index if not exists analysis_file_id_idx 
  on public.analysis(file_id);

create index if not exists analysis_status_idx 
  on public.analysis(status) 
  where status in ('pending', 'processing');

create index if not exists analysis_created_at_idx 
  on public.analysis(created_at desc);

-- Integrations table indexes
create index if not exists integrations_user_id_platform_idx 
  on public.integrations(user_id, platform);

create index if not exists integrations_status_idx 
  on public.integrations(status);

-- MCP tools table indexes
create index if not exists mcp_tools_integration_id_idx 
  on public.mcp_tools(integration_id);

create index if not exists mcp_tools_enabled_idx 
  on public.mcp_tools(enabled) 
  where enabled = true;

-- Composite index for knowledge base queries
create index if not exists knowledge_base_user_file_idx 
  on public.knowledge_base(user_id, file_id, chunk_index);

