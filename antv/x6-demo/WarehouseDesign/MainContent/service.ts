import { request } from 'umi';

export default {
  // 获取失败设置参数
  getFailureAction(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/azkaban/getFailureAction', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
  // 编辑调度
  schedule(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/schedule', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 设置并运行
  setAndRun(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/exec', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 推出編輯
  editQuit(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/finishEdit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 保存
  saveData(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/saveFlow', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 提交至生产的数据
  getSubmitData(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/preSubmit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 提交至生产
  submitPro(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/submit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 获取审批状态
  getApplicationStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/dict/applicationStatus', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  /**
   * 获取用户列表
   * @param {*} params
   * @return {*}
   */
  getUserList(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/userCenter/user/list', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  /**
   * 获取指定用户的基本信息
   * @param {*} params
   * @return {*}
   */
  getUserInfo(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/userCenter/info/get', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 还原生产
  reductionPro(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/restore', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 获取生产的操作区
  getProJob(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/jobSetOnline', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 获取调度信息
  getDispatchInfo(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/schedule/info', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 获取工作流运行状态
  getFlowRunStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/flowRunningCheck', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 停止工作流运行状态
  stopFlowRunStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/killFlow', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 获取代码版本
  getCodeVersion(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/job/version', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 提交至生产前检查版本是否一致
  checkProjectVersion(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/checkProjectVersion', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
};
