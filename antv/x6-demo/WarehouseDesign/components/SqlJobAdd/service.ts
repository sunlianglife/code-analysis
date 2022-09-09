import { request } from 'umi';

export default {
  // 获取sql代码
  getSqlContent(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/azkaban/getSqlContent', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
  // 获取sql代码 生产模式
  getSqlContentPro(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/getProSqlContent', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
  // 引擎列表
  getEngineList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/projectCenter/engine/list', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
  // 引擎预览
  getEngineInfo(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/projectCenter/engine/info', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 引擎预览内容详情
  getEngineDetail(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/azkaban/getEngineContent', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
  // 根据ID查询作业
  getJobById(params: any, tabKey?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/info', {
      method: 'GET',
      params: {
        ...params,
        env: tabKey,
      },
    });
  },
  // 根据需求ID查询信息
  getInfoByPaonesId(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/paones/info', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 检查代码是否可以添加
  getSqlCheck(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/addJobSql/check', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 根据参数货群命令预览
  getCommandPreview(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/previewCommand', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 获取数据库
  getDbList() {
    return request<API.ResultType>('/DATA-DEVELOP/hive/metastore/cache/getDbList', {
      method: 'GET',
    });
  },

  // 获取数据库下的表
  getTableList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/hive/metastore/cache/getTableList', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 获取表下面的字段
  getField(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/hive/metastore/cache/getColumnList', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 通过sql获取导出表
  getTitle(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/job/getTitle', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 鼠标移入作业展示信息
  getJobInfo(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/testSql/status', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
};

export function addJob(params: any) {
  return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/add', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}

export function editJob(params: any) {
  return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/update', {
    method: 'POST',
    data: {
      ...params,
    },
  });
}
