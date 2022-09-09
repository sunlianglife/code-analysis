import DevNewAdd from '@/pages/DataDevelopment/components/AddJob/newAdd';
import JobList from '../components/JobList';
import {
  JobSqlIcon,
  ScriptIcon,
  NonstdIcon,
  VirtualJobIcon,
  SparkJobIcon,
  MapReduceJobIcon,
} from '@/pages/DataDevelopment/icon';
import { message, Popover } from 'antd';
import styles from './index.less';
import { connect } from 'dva';
import { useState } from 'react';

const JobMenu: React.FC<any> = ({ dispatch, moveWidth, workflowId, workflowData }) => {
  const [visible, setVisible] = useState(false);

  const newAdd = (type: string) => {
    switch (type) {
      case 'sql':
        dispatch({
          type: 'sqlJobModel/setSqlJobModelData',
          payload: {
            visible: true,
            data: {
              type: 'add',
            },
          },
        });
        break;
      case 'spark':
        dispatch({
          type: 'sqlJobModel/setSparkJobModelData',
          payload: {
            visible: true,
            data: {
              type: 'add',
            },
          },
        });
        break;
      case 'mapReduce':
        dispatch({
          type: 'sqlJobModel/setMapReduceJobModelData',
          payload: {
            visible: true,
            data: {
              type: 'add',
            },
          },
        });
        break;
      case 'script':
        dispatch({
          type: 'sqlJobModel/setScriptJobModelData',
          payload: {
            visible: true,
            data: {
              type: 'add',
            },
          },
        });
        break;
      case 'nonstd':
        dispatch({
          type: 'sqlJobModel/setNonstdJobModelData',
          payload: {
            visible: true,
            data: {
              type: 'add',
            },
          },
        });
        break;
      case 'virtual':
        dispatch({
          type: 'sqlJobModel/saveJob',
          payload: {
            jobType: 6,
            name: workflowData.title,
            flowId: workflowId,
          },
          callback: (res: any) => {
            if (res) {
              if (res.success) {
                // 与操作区参数相关的保存-添加到操作区
                dispatch({
                  type: 'graphModel/setAddJobData',
                  payload: {
                    date: new Date().getTime(),
                    data: {
                      id: res.data,
                      shape: 'dag-node',
                      x: 200,
                      y: 200,
                      disabled: false,
                      closed: true,
                      data: {
                        label: workflowData.title,
                        outRely: false, // 是否为外部引用表
                        tableInfo: undefined,
                        flowId: workflowId,
                        jobType: 6,
                      },
                      flowId: workflowId,
                      ports: [
                        {
                          id: `${res.data}-1`,
                          group: 'top',
                        },
                        {
                          id: `${res.data}-2`,
                          group: 'bottom',
                        },
                      ],
                    },
                  },
                });
              } else {
                message.error(res.msg);
              }
            }
          },
        });
        break;
      default:
        break;
    }
  };

  const content = (
    <div className={styles.addPopover}>
      <div
        className={styles.addItem}
        onClick={() => {
          setVisible(false);
          newAdd('sql');
        }}
      >
        <div>
          <JobSqlIcon />
        </div>
        <div>SQL</div>
      </div>
      <div
        className={styles.addItem}
        onClick={() => {
          setVisible(false);
          newAdd('spark');
        }}
      >
        <div style={{ color: '#cc3800' }}>
          <SparkJobIcon />
        </div>
        <div>Spark</div>
      </div>
      <div
        className={styles.addItem}
        onClick={() => {
          setVisible(false);
          newAdd('mapReduce');
        }}
      >
        <div style={{ color: '#FF6A00' }}>
          <MapReduceJobIcon />
        </div>
        <div>MapReduce</div>
      </div>
      <div
        className={styles.addItem}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setVisible(false);
          newAdd('script');
        }}
      >
        <div style={{ color: '#9bc732' }}>
          <ScriptIcon />
        </div>
        <div>Script</div>
      </div>
      <div
        className={styles.addItem}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setVisible(false);
          newAdd('nonstd');
        }}
      >
        <div style={{ color: '#da9832' }}>
          <NonstdIcon />
        </div>
        <div>Nonstd</div>
      </div>
      <div
        className={styles.addItem}
        style={{ marginTop: '10px' }}
        onClick={() => {
          setVisible(false);
          newAdd('virtual');
        }}
      >
        <div style={{ color: '#e0681f' }}>
          <VirtualJobIcon />
        </div>
        <div>虚拟作业</div>
      </div>
    </div>
  );

  const handleVisibleChange = (flag: any) => {
    setVisible(flag);
  };

  return (
    <section className={styles.JobMenu}>
      <Popover
        placement="bottom"
        content={content}
        trigger="click"
        visible={visible}
        onVisibleChange={handleVisibleChange}
      >
        <DevNewAdd title="新增工作流作业" onClick={() => setVisible(true)} />
      </Popover>
      <JobList moveWidth={moveWidth} />
    </section>
  );
};

export default connect(
  ({ sqlJobModel, fileListModel }: { sqlJobModel: any; fileListModel: any }) => ({
    sqlJobModelData: sqlJobModel.sqlJobModelData,
    addTableJob: sqlJobModel.addTableJob,
    workflowId: fileListModel.workflowId,
    workflowData: fileListModel.workflowData,
  }),
)(JobMenu);
