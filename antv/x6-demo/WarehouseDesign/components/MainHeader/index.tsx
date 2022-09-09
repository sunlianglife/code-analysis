import { message, Spin, Tabs } from 'antd';
import { useEffect } from 'react';
import { connect } from 'dva';
import styles from './index.less';
import service from '../../MainContent/service';
import { NewGraph } from '../../MainContent/AntvDagContent/graph';
import { RefreshStatusIcon } from '@/pages/DataDevelopment/icon';

const { TabPane } = Tabs;

const status = {
  0: '未上线',
  1: '已上线未建生产表',
  2: '已上线已建生产表',
  3: '已调度',
};

const MainHeader: React.FC<any> = (props) => {
  const { workflowId, dispatch, flowStatus, tabKey, currentFlowStatus, loading, fileListModel } = props;

  // 刷新工作流状态
  const refresh = () => {
    dispatch({
      type: 'graphModel/getFlowStatus',
      payload: { flowId: workflowId },
    });
  };

  useEffect(() => {
    if (workflowId) {
      refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workflowId]);

  // 保存

  const save = (value: any) => {
    // 与操作区参数相关的保存-保存
    const params = {
      id: workflowId,
      jobSet: JSON.stringify(
        value.map((item: any) => {
          if (item.shape === 'dag-edge') {
            return {
              id: item.id,
              source: item.source,
              target: item.target,
              zIndex: item.zIndex,
              shape: 'dag-edge',
            };
          }
          return {
            data: {
              ...item.data,
              flowId: item.flowId || item.data.flowId || item.data.tableInfo.flowId,
            },
            ports: item.ports.items,
            id: item.id,
            shape: 'dag-node',
            zIndex: item.zIndex,
            x: item.position.x,
            y: item.position.y,
            disabled: item?.disabled ?? false,
            closed: item?.closed ?? true,
          };
        }),
      ),
    };
    service.saveData(params).then((res: any) => {
      if (res) {
        if (res.success) {
          console.log(111);
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  // 切换查询生产&开发模式下的操作区数据
  const tabChange = (value: any) => {
    // 查询生产模式下的数据
    if (value === 'pro') {
      if (!workflowId) {
        message.error('请先选择工作流！');
        return;
      }
      // 先保存开发环境的数据
      if (NewGraph?.graph?.toJSON && fileListModel.workflowType === 'edit') {
        const data = NewGraph.graph.toJSON().cells;
        save(data);
      }
      service.getProJob({ flowId: workflowId }).then((res: any) => {
        if (res) {
          if (res.success) {
            // 切换生产和开发的状态
            // dispatch({
            //   type: 'fileListModel/setCurrentFlowStatus',
            //   payload: true,
            // });
            // 设置操作区数据
            dispatch({
              type: 'fileListModel/setFlowData',
              payload: res.data ? JSON.parse(res.data) : [],
            });
            // 生产开发环境的key
            dispatch({
              type: 'fileListModel/setTabKey',
              payload: value,
            });
          } else {
            message.error(res.msg);
            // 报错之后从新查询开发数据
            dispatch({
              type: 'fileListModel/getFlowById',
              payload: {
                id: workflowId,
              },
            });
          }
        } else {
          // 报错之后从新查询开发数据
          dispatch({
            type: 'fileListModel/getFlowById',
            payload: {
              id: workflowId,
            },
          });
        }
      });
    } else {
      // 切换生产和开发的状态
      // dispatch({
      //   type: 'fileListModel/setCurrentFlowStatus',
      //   payload: false,
      // });
      // 重新查询开发数据
      dispatch({
        type: 'fileListModel/getFlowById',
        payload: {
          id: workflowId,
        },
      });
      // 生产开发环境的key
      dispatch({
        type: 'fileListModel/setTabKey',
        payload: value,
      });
      //  作业list
      dispatch({
        type: 'fileListModel/getJobList',
        payload: {
          flowId: workflowId,
        },
      });
    }
  };

  return (
    <div className={styles.mainHeader}>
      {workflowId ? (
        <div className={styles.onLineFlag}>
          <Spin spinning={tabKey === 'pro' ? loading : false}>
            <span>{status[flowStatus]}</span>
          </Spin>
          {tabKey === 'pro' && (
            <RefreshStatusIcon
              style={{ position: 'absolute', right: '-22px', top: '7px' }}
              onClick={refresh}
            />
          )}
        </div>
      ) : null}
      <div style={{ marginLeft: 'calc(50% - 50px)' }}>
        <Tabs activeKey={tabKey} defaultActiveKey="dev" onChange={tabChange}>
          <TabPane tab="开发" key="dev"></TabPane>
          <TabPane tab="生产" key="pro"></TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default connect(
  ({
    fileListModel,
    graphModel,
    loading,
  }: {
    fileListModel: any;
    graphModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    openData: fileListModel.openData,
    workflowId: fileListModel.workflowId,
    currentFlowStatus: fileListModel.currentFlowStatus,
    flowStatus: graphModel.flowStatus,
    tabKey: fileListModel.tabKey,
    fileListModel,
    loading: loading.effects['graphModel/getFlowStatus'],
  }),
)(MainHeader);
