import { request } from 'umi';

export default {
  getSqlFiles(params: any) {
    return request<API.ResultType>('/DATA-DEVELOP/azkaban/getSqlFiles', {
      method: 'GET',
      params: {
        ...params,
      },
    });
  },
};
