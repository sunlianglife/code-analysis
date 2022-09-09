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

  // 项目文件列表
  getProjectFile(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/projectCenter/file/list', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 项目文件信息
  getProjectFileInfo(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/projectCenter/file/info', {
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
