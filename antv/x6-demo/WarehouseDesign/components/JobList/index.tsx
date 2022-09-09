/* eslint-disable consistent-return */
import {
  JobCloseIcon,
  JobItemIcon,
  JobJoinIcon,
  JobCloseUnIcon,
  JobJoinUnIcon,
  VirtualJobIcon,
  NonstdIcon,
  ScriptIcon,
  SparkJobIcon,
  MapReduceJobIcon,
} from '@/pages/DataDevelopment/icon';
import classnames from 'classnames';
import { Collapse, message } from 'antd';
import { useEffect, useState } from 'react';
import styles from './index.less';
import { connect } from 'dva';
import { NewGraph } from '../../MainContent/AntvDagContent/graph';
import service from '../../api/service';

const { Panel } = Collapse;

const JobList: React.FC<any> = (props: any) => {
  const { jobList, dispatch, projectId, workflowId, moveWidth } = props;
  const [activeKey, setActiveKey] = useState([11]);

  const processingData = (data: any) => {
    // 与操作区参数相关的保存-添加到操作区
    const info = {
      id: data.key,
      shape: 'dag-node',
      x: 200,
      y: 200,
      disabled: false,
      closed: true,
      data: {
        label: data.title,
        outRely: workflowId !== data.flowId, // 是否为外部引用表
        tableInfo: data?.children[0] ? data?.children[0] : undefined,
        flowId: data.flowId,
        jobType: data.jobType,
      },
      flowId: data.flowId,
      ports: [
        {
          id: `${data.key}-1`,
          group: 'top',
        },
        {
          id: `${data.key}-2`,
          group: 'bottom',
        },
      ],
    };
    dispatch({
      type: 'graphModel/setAddJobData',
      payload: {
        date: new Date().getTime(),
        data: info,
      },
    });
  };

  // 删除作业
  const deleteItem = (e: any, value: any) => {
    e.stopPropagation();
    console.log(NewGraph.graph.toJSON().cells);
    if (
      NewGraph.graph.toJSON()?.cells.length &&
      NewGraph.graph.toJSON()?.cells.some((item: any) => item.id === value.key)
    ) {
      message.error('请先从操作区移除该作业！');
    } else {
      service.deleteJob({ id: value.key }).then((res: any) => {
        if (res) {
          if (res.success) {
            message.success('操作成功');
            dispatch({
              type: 'fileListModel/getJobList',
              payload: {
                flowId: workflowId,
              },
            });
          } else {
            message.error(res.msg);
          }
        }
      });
    }
  };

  // 添加作业
  const joinItem = (e: any, value: any, jobValue?: any) => {
    e.stopPropagation();
    if (value.mapType) {
      // 2 输入表 1 输出表  只有检查作业才会有
      // 检查作业创建需要自动关联目标作业，此处先找出所有的目标作业
      const targetJob = jobList.filter((i: any) =>
        i?.children.some((y: any) => y.title === value.title),
      );
      dispatch({
        type: 'sqlJobModel/setJobPar',
        payload: targetJob,
      });

      service
        .getByTableName({
          tableName: value.title,
          projectId,
        })
        .then((res: any) => {
          if (res) {
            // 添加检查作业时，校验引用表与目标表命名，若同名，弹窗提示
            if (jobValue.children.some((i: any) => i.mapType === 1 && i.title === value.title)) {
              message.error('此引用表与目标表同名，为防止死锁，请谨慎添加！');
            }
            if (res.data.length) {
              // processingData(res.data);
              if (res.data && res.data.length) {
                // if (res.data[0].flowId === workflowId) {
                //   message.error('该表并非外部工作流的作业写入表，不可添加！');
                // } else {
                // 创建检查作业
                dispatch({
                  type: 'sqlJobModel/setAddTableJob',
                  payload: {
                    visible: true,
                    data: { ...value, externalFlow: res.data[0].flowId, modalType: 'add' },
                  },
                });
                // }
              }
            } else {
              dispatch({
                type: 'sqlJobModel/setAddTableJob',
                payload: {
                  visible: true,
                  data: { ...value, externalFlow: null, modalType: 'add' },
                },
              });
            }
          }
        });
    } else {
      processingData(value);
    }
  };

  useEffect(() => {
    if (jobList && jobList.length) setActiveKey([jobList[0].key]);
  }, [jobList]);

  const renderColor = (value: any) => {
    if (value.jobType === 1) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#38CCB5' };
    }
    if (value.jobType === 3 || value.jobType === 4) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#9bc732' };
    }
    if (value.jobType === 5) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#da9832' };
    }
    if (value.jobType === 6) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#e0681f' };
    }
    if (value.jobType === 7) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#cc3800' };
    }
    if (value.jobType === 8) {
      return activeKey && String(activeKey[0]) === String(value.key)
        ? { color: '#fff' }
        : { color: '#FF6A00' };
    }
  };

  const renderHeader = (value: any) => {
    return (
      <div style={{ display: 'inline-block', height: '30px', width: '100%' }}>
        <div
          className={classnames({
            [styles.header]: true,
            [styles.headerBg]: activeKey && String(activeKey[0]) === String(value.key),
          })}
          style={renderColor(value)}
        >
          {value.jobType === 1 && <JobItemIcon style={{ marginLeft: '10px' }} />}
          {(value.jobType === 3 || value.jobType === 4) && (
            <ScriptIcon style={{ marginLeft: '10px' }} />
          )}
          {value.jobType === 5 && <NonstdIcon style={{ marginLeft: '10px' }} />}
          {value.jobType === 6 && <VirtualJobIcon style={{ marginLeft: '10px' }} />}
          {value.jobType === 7 && <SparkJobIcon style={{ marginLeft: '10px' }} />}
          {value.jobType === 8 && <MapReduceJobIcon style={{ marginLeft: '10px' }} />}
          {/* <Tooltip placement="top" title={value.title}> */}
          <span
            style={
              activeKey && String(activeKey[0]) === String(value.key)
                ? {
                    marginLeft: '10px',
                    fontSize: '14px',
                    color: '#fff',
                    width: `${70 + moveWidth}px`,
                  }
                : {
                    marginLeft: '10px',
                    fontSize: '14px',
                    color: '#3C4443',
                    width: `${70 + moveWidth}px`,
                  }
            }
            className={styles.headerTitle}
            title={value.title}
          >
            {value.title}
          </span>
          {/* </Tooltip> */}
          {activeKey && String(activeKey[0]) === String(value.key) ? (
            <JobJoinIcon
              onClick={(e: any) => joinItem(e, value)}
              style={{ position: 'absolute', right: '32px' }}
            />
          ) : (
            <JobJoinUnIcon
              onClick={(e: any) => joinItem(e, value)}
              style={{ position: 'absolute', right: '32px' }}
            />
          )}
          {activeKey && String(activeKey[0]) === String(value.key) ? (
            <JobCloseIcon
              onClick={(e: any) => deleteItem(e, value)}
              style={{ position: 'absolute', right: '9px' }}
            />
          ) : (
            <JobCloseUnIcon
              onClick={(e: any) => deleteItem(e, value)}
              style={{ position: 'absolute', right: '9px' }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderChildren = (value: any) => {
    return (
      <div className={styles.renderChildren}>
        {/* eslint-disable-next-line array-callback-return */}
        {value.children.map((item: any) => {
          // 展示输入表
          if (item.mapType === 2) {
            return (
              <div className={styles.children}>
                <span
                  title={item.title}
                  style={{
                    marginLeft: '10px',
                    fontSize: '16px',
                    color: '#3C4443',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inlineBlock',
                    width: `${70 + moveWidth}px`,
                  }}
                >
                  {item.title}
                </span>
                <JobJoinUnIcon
                  onClick={(e: any) => joinItem(e, item, value)}
                  style={{ position: 'absolute', right: '9px' }}
                />
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  const collapseChange = (value: any) => {
    setActiveKey(value ? [value] : []);
  };

  return (
    <div className={styles.DJobList}>
      {/* <Spin spinning={dataLoading}> */}
      <Collapse
        defaultActiveKey={activeKey}
        activeKey={activeKey}
        ghost
        accordion
        onChange={(e) => collapseChange(e)}
      >
        {jobList.map((item: any) => (
          <Panel header={renderHeader(item)} key={item.key}>
            {item?.children?.length ? renderChildren(item) : null}
          </Panel>
        ))}
      </Collapse>
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
    jobList: fileListModel.jobList,
    projectId: fileListModel.projectId,
    workflowId: fileListModel.workflowId,
    dataLoading: loading.effects['fileListModel/getJobList'],
  }),
)(JobList);
