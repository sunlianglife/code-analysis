import styles from './index.less';
import {
  DispatchIcon,
  EnlargeIcon,
  FocusIcon,
  NarrowIcon,
  RefreshIcon,
  RunResultIcon,
  StopDispatchIcon,
  DispatchInfoIcon,
  // SearchMapIcon,
} from '@/pages/DataDevelopment/icon';
import { connect } from 'dva';
import service from '../api/service';
import { message, Tooltip } from 'antd';

const ToTop: React.FC<any> = ({
  dispatch,
  workflowId,
  flowStatus,
  workflowType,
  currentFlowStatus,
  projectId,
}) => {
  const iconClick = (key: string) => {
    switch (key) {
      case 'dispatch':
        dispatch({
          type: 'graphModel/setEditDispatch',
          payload: {
            visible: true,
            data: {},
          },
        });
        break;
      case 'stopDispatch':
        service.stopDispatch({ id: workflowId }).then(async (res: any) => {
          if (res) {
            if (res.success) {
              message.success('操作成功');
              dispatch({
                type: 'graphModel/getFlowStatus',
                payload: { flowId: workflowId },
              });
              // 重新查询fileList
              dispatch({
                type: 'fileListModel/fetchById',
                payload: { id: projectId },
              });
              await dispatch({
                type: 'fileListModel/setFlowData',
                payload: [],
              });
              service.getProJob({ flowId: workflowId }).then((res1: any) => {
                if (res) {
                  if (res.success) {
                    dispatch({
                      type: 'fileListModel/setFlowData',
                      payload: res1.data ? JSON.parse(res1.data) : [],
                    });
                  }
                }
              });
            } else {
              message.error(res.msg);
            }
          }
        });
        break;
      case 'result':
        dispatch({
          type: 'graphModel/setRunResultData',
          payload: {
            visible: true,
            type: 'pro',
            data: {},
          },
        });
        break;
      case 'dispatchInfo':
        dispatch({
          type: 'graphModel/setEditDispatch',
          payload: {
            visible: true,
            data: {
              type: 'preview',
            },
          },
        });
        break;
      default:
        break;
    }
    // 触发获取操作区数据的方法
    dispatch({
      type: 'graphModel/setToJsonDate',
    });
  };

  const onHandleSideToolbar = (key: string) => {
    dispatch({
      type: 'graphModel/setGraphOperation',
      payload: key,
    });
  };

  return (
    <div className={styles.toTop}>
      <div className={styles.left}>
        {/* 工作流状态为 "已上线已建生产表" */}
        {flowStatus === 2 && !currentFlowStatus && workflowType === 'edit' && (
          <div className={styles.contentIcon} onClick={() => iconClick('dispatch')}>
            <DispatchIcon style={{ verticalAlign: 'middle' }} />
            <span className={styles.title}>编辑调度</span>
          </div>
        )}
        {/* 工作流状态为 "已调度" */}
        {flowStatus === 3 && workflowType === 'edit' && (
          <div className={styles.contentIcon} onClick={() => iconClick('stopDispatch')}>
            <StopDispatchIcon style={{ verticalAlign: 'middle' }} />
            <span className={styles.title}>停止调度</span>
          </div>
        )}
        {/* 工作流状态为 "已调度" */}
        {flowStatus === 3 && (
          <div className={styles.contentIcon} onClick={() => iconClick('dispatchInfo')}>
            <DispatchInfoIcon style={{ verticalAlign: 'middle' }} />
            <span className={styles.title} style={{ marginLeft: '5px' }}>
              调度信息
            </span>
          </div>
        )}
        <div className={styles.contentIcon} onClick={() => iconClick('result')}>
          <RunResultIcon style={{ verticalAlign: 'middle' }} />
          <span className={styles.title}>运行结果</span>
        </div>
        {/* TODO 一期隐藏搜索作业-生产 */}
        {/* <div className={styles.contentIcon} onClick={() => iconClick('searchJob')}>
          <SearchMapIcon style={{ verticalAlign: 'middle' }} />
          <span className={styles.title}>搜索作业</span>
        </div> */}
      </div>
      <div className={styles.right}>
        <Tooltip placement="top" title="居中">
          <FocusIcon onClick={() => onHandleSideToolbar('fit')} className={styles.icon} />
        </Tooltip>
        <Tooltip placement="top" title="放大">
          <EnlargeIcon onClick={() => onHandleSideToolbar('in')} className={styles.icon} />
        </Tooltip>
        <Tooltip placement="top" title="缩小">
          <NarrowIcon onClick={() => onHandleSideToolbar('out')} className={styles.icon} />
        </Tooltip>
        <Tooltip placement="top" title="实际尺寸">
          <RefreshIcon onClick={() => onHandleSideToolbar('refresh')} className={styles.icon} />
        </Tooltip>
      </div>
    </div>
  );
};

export default connect(
  ({ fileListModel, graphModel }: { fileListModel: any; graphModel: any }) => ({
    workflowId: fileListModel.workflowId,
    workflowType: fileListModel.workflowType,
    projectId: fileListModel.projectId,
    currentFlowStatus: fileListModel.currentFlowStatus,
    currentJSONData: graphModel.currentJSONData,
    flowStatus: graphModel.flowStatus,
    workflowData: fileListModel.workflowData,
    flowData: fileListModel.flowData,
  }),
)(ToTop);
