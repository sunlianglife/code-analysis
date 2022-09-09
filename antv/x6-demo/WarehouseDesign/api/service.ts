import { request } from 'umi';

export default {
  getTreeByPid(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/getTreeByPid', {
      method: 'GET',
      headers: {
        Connection: 'keep-alive',
      },
      params: {
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

  // 获取审批状态
  getApplicationStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/dict/applicationStatus', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 推出編輯
  editQuit(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/finishEdit', {
      method: 'POST',
      headers: {
        Connection: 'keep-alive',
      },
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

  // 右侧代码状态list
  getCodeStatusList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/jobApply/status', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 运行单个任务
  runOneJob(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/execJob', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  getJobList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/get', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 通过表名获取对应的作业
  getByTableName(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/getByTableName', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 通过工作流id查询
  getFlowById(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/getFlowById', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 运行结果左侧list
  getResultList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/log/get', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 运行结果左侧list生产
  getResultProList(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/proLog/get', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 作业日志
  getJobLogs(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/logData/job', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 工作流日志
  getWorkflowLogs(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/logData/flow', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 查询列表视图
  getResultListInfo(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/log/info', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 删除作业
  deleteJob(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/job/delete', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 创建编辑检查作业
  tabJobAddEdit(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/checkJob/addOrEdit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 获取工作流历史版本
  getHistoryWorkflow(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/nameBefore', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 作业代码提交
  jobCodeSubmit(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/testSql/submit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 取消代码提交
  jobCodeSubmitCancel(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/testSql/cancel', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 工作流状态
  getWorkFlowStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/dict/flowStatus', {
      method: 'GET',
      params: {
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

  // 停止调度
  stopDispatch(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/unSchedule', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 获取工作流状态
  getFlowStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/flow/status', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 鼠标移入作业展示信息 生产
  getJobInfoPro(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/proSql/status', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },

  // 获取单个任务运行状态
  getTaskRunStatus(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/jobRunningCheck', {
      method: 'POST',
      data: params,
    });
  },

  // 停止运行单个任务
  stopTaskRun(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/killJob', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 生产作业开关
  proJobSwitch(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/online/job/switch', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 检查作业代码内容版本与git是否一致
  checkSqlContentCommitId(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/checkSqlContentCommitId', {
      method: 'get',
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
};
