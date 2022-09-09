import FileMenu from './FileMenu';
import JobMenu from './JobMenu';
import styles from './index.less';
import { CaretLeftOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import MainContent from './MainContent';
import { connect } from 'dva';
import service from './api/service';
import { NewGraph } from './MainContent/AntvDagContent/graph';
import { message } from 'antd';
import { Resizable } from 're-resizable';
import { useParams } from 'umi';
import { qiankunPush } from '@/utils/qiankunHistory';

const WarehouseDesign: React.FC<any> = ({
  workflowId,
  jobListTime,
  shrinkTime,
  tabKey,
  currentFlowStatus, // 工作流是否正在被编辑
  workflowType,
  dispatch,
}) => {
  const [shrinkFlag, setShrink] = useState(false);
  const [moveWidth, setMoveWidth] = useState(0);
  const [stopWidth, setStopWidth] = useState(0);
  const { projectId, projectName } = useParams<any>();

  // 重置位置
  const resetWidth = () => {
    setMoveWidth(0);
    setStopWidth(0);
  };

  useEffect(() => {
    if (!Number(projectId)) {
      qiankunPush('/project/development/index/warehouseDesign/entry');
    } else {
      // 查询所有项目
      dispatch({
        type: 'fileListModel/fetch',
        payload: {},
      });
      dispatch({
        type: 'fileListModel/setProjectId',
        payload: Number(projectId),
      });
      dispatch({
        type: 'fileListModel/setProjectName',
        payload: projectName,
      });
    }
  }, []);

  const iconCLick = () => {
    resetWidth();
    if (!workflowId && !shrinkFlag) {
      message.error('请先编辑工作流！');
      return;
    }
    setShrink(!shrinkFlag);
  };

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (shrinkTime) {
      setShrink(false);
      resetWidth();
    }
  }, [shrinkTime]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    if (jobListTime && !currentFlowStatus) {
      setShrink(true);
    }
  }, [jobListTime]);

  useEffect(() => {
    if (tabKey === 'pro' || currentFlowStatus) {
      setShrink(false);
      resetWidth();
    } else if (workflowId) {
      setShrink(true);
      resetWidth();
    }
  }, [tabKey]);

  useEffect(() => {
    service.getApplicationStatus().then((res: any) => {
      if (res) {
        if (res.success) {
          dispatch({
            type: 'graphModel/setAppStatus',
            payload: res.data,
          });
        } else {
          message.error(res.msg);
        }
      }
    });
  }, []);

  const beforeLoad = () => {
    if (NewGraph && NewGraph.graph && NewGraph.graph.toJSON().cells.length) {
      // 与操作区参数相关的保存-保存
      const params = {
        id: workflowId,
        jobSet: JSON.stringify(
          NewGraph.graph.toJSON().cells.map((item: any) => {
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
      service.saveData(params);
      service.editQuit({
        id: workflowId,
      });
    }
  };

  // 离开页面触发提示
  useEffect(() => {
    if (workflowType === 'edit' && workflowId) {
      window.onbeforeunload = (event: any) => {
        beforeLoad();
        // eslint-disable-next-line no-param-reassign
        event = event || window.event;
        // 兼容IE8和Firefox 4之前的版本
        if (event) {
          // eslint-disable-next-line no-param-reassign
          event.returnValue = '关闭提示';
        }
        // Chrome, Safari, Firefox 4+, Opera 12+ , IE 9+
        // return '关闭提示';
        return event;
      };
    } else {
      window.onbeforeunload = null;
    }
    return () => {
      window.onbeforeunload = null;
    };
  }, [workflowType, workflowId]);

  return (
    <div className={styles.warehouseDesign}>
      {/* <Spin spinning={dataLoading}> */}
      <FileMenu />
      {tabKey === 'dev' && !currentFlowStatus && shrinkFlag && workflowType === 'edit' && (
        <Resizable
          defaultSize={{ width: 230, height: '100%' }}
          minWidth={230}
          enable={{
            top: false,
            right: true,
            bottom: false,
            left: false,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          onResize={(e: any, direction: any, ref: any, d: any) => {
            console.log('size', d);
            setMoveWidth(stopWidth + d.width);
          }}
          onResizeStop={(e: any, direction: any, ref: any, d: any) => {
            console.log('stop', d);
            setStopWidth(stopWidth + d.width);
          }}
        >
          <JobMenu moveWidth={moveWidth} />
        </Resizable>
      )}
      <section
        className={styles.mainContent}
        style={
          tabKey === 'dev' && !currentFlowStatus && shrinkFlag && workflowType === 'edit'
            ? { width: `calc(100% - ${460 + moveWidth}px)` }
            : { width: 'calc(100% - 230px)' }
        }
      >
        {tabKey === 'dev' && !currentFlowStatus && workflowType === 'edit' && (
          <div className={styles.shrink}>
            {shrinkFlag ? (
              <CaretLeftOutlined
                onClick={iconCLick}
                style={{ color: '#DFDFDF', fontSize: '18px' }}
              />
            ) : (
              <CaretRightOutlined
                onClick={iconCLick}
                style={{ color: '#DFDFDF', fontSize: '18px' }}
              />
            )}
          </div>
        )}
        <MainContent />
      </section>
      {/* </Spin> */}
    </div>
  );
};

export default connect(
  ({
    fileListModel,
    loading,
  }: {
    fileListModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    workflowId: fileListModel.workflowId,
    workflowType: fileListModel.workflowType,
    projectId: fileListModel.projectId,
    jobListTime: fileListModel.jobListTime,
    jobList: fileListModel.jobList,
    tabKey: fileListModel.tabKey,
    shrinkTime: fileListModel.shrinkTime,
    currentFlowStatus: fileListModel.currentFlowStatus,
    dataLoading: loading.effects['autoJob/fetch'],
  }),
)(WarehouseDesign);
