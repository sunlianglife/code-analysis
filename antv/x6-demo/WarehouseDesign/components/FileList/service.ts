import { request } from 'umi';

export default {
  // 删除文件夹或者工作流
  deleteFileOrWork(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/delete', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },
  addFileOrWorkFlow(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/add', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  editFileOrWorkFlow(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/rename', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },

  // 判断是否有人正在编辑
  checkEdit(params: any) {
    const aa = request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/checkEdit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
    console.log(aa, 22);
    return aa;
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

  // 推出編輯
  editQuit(params?: any) {
    return request<API.ResultType>('/DATA-DEVELOP/project/dirOrFlow/finishEdit', {
      method: 'POST',
      data: {
        ...params,
      },
    });
  },
};
