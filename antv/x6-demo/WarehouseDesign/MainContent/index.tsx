import { connect } from 'dva';
import MainHeader from '../components/MainHeader';
import AntvDagContent from './AntvDagContent/graph';
import SetRunModal from './operationModal/SetRunModal';
import RunResultModal from './operationModal/RunResultModal';
import RelyListDrawer from './operationModal/RelyList';
import SubmitToProduction from './operationModal/SubmitToProduction';
import CodeStatus from './operationModal/CodeStatus';
import EditScheduling from './operationModal/EditScheduling';
import SqlJobAdd from '../components/SqlJobAdd';
import ScriptJobModal from '../components/ScriptJobModal';
import TableJobModal from '../components/TableJobModal';
import NonstdJobModal from '../components/NonstdJobModal';
import CodeCompare from './operationModal/CodeCompare';
import SparkJobModal from '../components/SparkJobModal';
import MapReduceJobModal from '../components/MapReduceJobModal';
import ToTop from './ToTop';
import ToTopPro from './ToTopPro';
import styles from './index.less';

const MainContent: React.FC<any> = (props) => {
  const {
    setRunData,
    relyList,
    runResultData,
    submitToProductionData,
    tabKey,
    workflowId,
    dispatch,
    codeStatusList,
    editDispatch,
    sqlJobModelData,
    addTableJob,
    scriptJobModelData,
    mapReduceJobModelData,
    sparkJobModelData,
    nonstdJobModelData,
    compareData,
  } = props;

  const onClick = (key: string) => {
    switch (key) {
      case 'rely':
        // 触发获取操作区数据的方法
        dispatch({
          type: 'graphModel/setToJsonDate',
        });
        dispatch({
          type: 'graphModel/setRelyList',
          payload: {
            visible: true,
            data: {},
          },
        });
        break;
      case 'codeStatus':
        // 触发获取操作区数据的方法
        dispatch({
          type: 'graphModel/setToJsonDate',
        });
        dispatch({
          type: 'graphModel/setCodeStatusList',
          payload: {
            visible: true,
            data: {},
          },
        });
        break;
      default:
        break;
    }
  };

  const onCancel = () => {
    // 晴空所选中Sql作业
    dispatch({
      type: 'sqlJobModel/setJobItem',
      payload: {},
    });
    // 取消表新增弹框
    dispatch({
      type: 'sqlJobModel/setAddTableJob',
      payload: {
        visible: false,
        data: null,
      },
    });
    dispatch({
      type: 'sqlJobModel/setSqlJobModelData',
      payload: {
        visible: false,
        data: null,
      },
    });
    dispatch({
      type: 'sqlJobModel/setSparkJobModelData',
      payload: {
        visible: false,
        data: null,
      },
    });
    dispatch({
      type: 'sqlJobModel/setMapReduceJobModelData',
      payload: {
        visible: false,
        data: null,
      },
    });
    dispatch({
      type: 'sqlJobModel/setScriptJobModelData',
      payload: {
        visible: false,
        data: null,
      },
    });
    dispatch({
      type: 'sqlJobModel/setNonstdJobModelData',
      payload: {
        visible: false,
        data: null,
      },
    });
  };

  return (
    <div style={{ width: '100', height: '100%' }}>
      <MainHeader />
      <section style={{ height: 'calc(100% - 54px)', position: 'relative' }}>
        {workflowId ? <>{tabKey === 'dev' ? <ToTop /> : <ToTopPro />}</> : null}
        <AntvDagContent />
        {workflowId && tabKey === 'dev' && (
          <div className={styles.rightHandle}>
            {/* TODO 一期隐藏搜索作业-生产 */}
            {/* <div className={styles.rightBut} onClick={() => onClick('rely')}>
              内部依赖检测
            </div> */}
            <div className={styles.rightBut} onClick={() => onClick('codeStatus')}>
              代码状态
            </div>
          </div>
        )}
      </section>
      {setRunData.visible && <SetRunModal />}
      {runResultData.visible && <RunResultModal />}
      {relyList.visible && <RelyListDrawer />}
      {submitToProductionData.visible && <SubmitToProduction />}
      {codeStatusList.visible && <CodeStatus />}
      {editDispatch.visible && <EditScheduling />}
      {sqlJobModelData.visible && (
        <SqlJobAdd visible={sqlJobModelData.visible} onCancel={onCancel} />
      )}
      {sparkJobModelData.visible && (
        <SparkJobModal visible={sparkJobModelData.visible} onCancel={onCancel} />
      )}
      {mapReduceJobModelData.visible && (
        <MapReduceJobModal visible={mapReduceJobModelData.visible} onCancel={onCancel} />
      )}
      {scriptJobModelData.visible && (
        <ScriptJobModal visible={scriptJobModelData.visible} onCancel={onCancel} />
      )}
      {nonstdJobModelData.visible && (
        <NonstdJobModal visible={nonstdJobModelData.visible} onCancel={onCancel} />
      )}
      {addTableJob.visible && <TableJobModal visible={addTableJob.visible} onCancel={onCancel} />}
      {compareData.visible && <CodeCompare />}
    </div>
  );
};

export default connect(
  ({
    graphModel,
    fileListModel,
    sqlJobModel,
  }: {
    graphModel: any;
    fileListModel: any;
    sqlJobModel: any;
  }) => ({
    setRunData: graphModel.setRunData,
    editDispatch: graphModel.editDispatch,
    runResultData: graphModel.runResultData,
    codeStatusList: graphModel.codeStatusList,
    submitToProductionData: graphModel.submitToProductionData,
    relyList: graphModel.relyList,
    tabKey: fileListModel.tabKey,
    workflowId: fileListModel.workflowId,
    sqlJobModelData: sqlJobModel.sqlJobModelData,
    sparkJobModelData: sqlJobModel.sparkJobModelData,
    mapReduceJobModelData: sqlJobModel.mapReduceJobModelData,
    scriptJobModelData: sqlJobModel.scriptJobModelData,
    nonstdJobModelData: sqlJobModel.nonstdJobModelData,
    addTableJob: sqlJobModel.addTableJob,
    compareData: graphModel.compareData,
  }),
)(MainContent);
