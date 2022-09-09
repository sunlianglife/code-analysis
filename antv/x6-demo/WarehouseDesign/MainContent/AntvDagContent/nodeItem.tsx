import {
  JobSqlIcon,
  NonstdIcon,
  ScriptIcon,
  TableJobIcon,
  VirtualJobIcon,
  SparkJobIcon,
  MapReduceJobIcon,
} from '@/pages/DataDevelopment/icon';
import { NewGraph } from './graph';
import { getDvaApp } from 'umi';
import { Menu, ContextMenu } from '@antv/x6-react-components';
import '@antv/x6-react-components/es/menu/style/index.css';
import '@antv/x6-react-components/es/dropdown/style/index.css';
import '@antv/x6-react-components/es/context-menu/style/index.css';
import styles from './index.less';
import classNames from 'classnames';
import service from '../../api/service';
import { message, Tooltip, Switch, Spin, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { ExclamationCircleOutlined, FileSearchOutlined } from '@ant-design/icons';
import SubmitCode from '@/pages/DataDevelopment/components/SubmitCode';
import moment from 'moment';

const status = {
  0: '未提交',
  1: '未审批',
  2: '已审批',
  3: '已拒绝',
  4: '已取消',
};

const commonStyle = {
  position: 'absolute',
  top: '11px',
  left: '10px',
};

// getDvaApp()['_models']   所有models的state,resucer,effects都有

// getDvaApp()._store.dispatch({  //调用dispatch(所有models都可以)
//   type:"",
//   payload:""
// })

const NodeItem: React.FC<any> = (props) => {
  const {
    node,
    currentFlowStatus, // 是否可以操作（生产模式或者其他人正在编辑）
  } = props;
  const [infoData, setInfoData] = useState<any>({});
  const [codeFlag, setCodeFlag] = useState<any>(false); // 代码提交弹框
  const [codeType, setCodeType] = useState('code');
  const [taskRunFlag, setTaskRunFlag] = useState(false); // 运行状态
  const [jobDisable, setJobDisable] = useState(false); // 禁用状态
  const [loading, setLoading] = useState(false);
  const [switchChecked, setSwitchChecked] = useState(false);

  useEffect(() => {
    getDvaApp()
      ['_store'].getState()
      .fileListModel.flowData.forEach((i: any) => {
        // eslint-disable-next-line
        if (i.id == props.node.id) {
          setSwitchChecked(props.node.store.data?.closed ?? false);
          setJobDisable(props.node.store.data?.disabled ?? false);

        }
      });
  }, [node?.id]);

  const submitCode = () => {
    // 代码提交
    service.jobCodeSubmit({ id: props.node.id }).then((res: any) => {
      if (res) {
        if (res.success) {
          message.success('操作成功');
        } else {
          message.error(res.msg);
        }
      }
    });
  }

  const rightClick = (key: string) => {
    const { fileListModel } = getDvaApp()['_store'].getState();
    let nowFlowData: any = [];
    switch (key) {
      case 'delete':
        // 检查作业或者虚拟作业移除之后需要删除数据
        if (node.store.data.data.jobType === 2 || node.store.data.data.jobType === 6) {
          service.deleteJob({ id: props.node.id }).then((res: any) => {
            if (res) {
              if (res.success) {
                NewGraph.graph.removeNode(props.node.id);
              } else {
                message.error(res.msg);
              }
            }
          });
        } else {
          NewGraph.graph.removeNode(props.node.id);
        }
        break;
      case 'preview':
        if (node.store.data.data.jobType === 2) {
          // 检查作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setAddTableJob',
            payload: {
              visible: true,
              data: { modalType: 'preview', modalId: props.node.id },
            },
          });
        } else if (node.store.data.data.jobType === 1) {
          // 普通作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setSqlJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'preview',
                title: node.store.data.data.label,
              },
            },
          });
        } else if (node.store.data.data.jobType === 3 || node.store.data.data.jobType === 4) {
          // script作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setScriptJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'preview',
              },
            },
          });
        } else if (node.store.data.data.jobType === 5) {
          // Nonstd作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setNonstdJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'preview',
              },
            },
          });
        } else if (node.store.data.data.jobType === 7) {
          // spark作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setSparkJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'preview',
                title: node.store.data.data.label,
              },
            },
          });
        } else if (node.store.data.data.jobType === 8) {
          // mapReduce作业预览
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setMapReduceJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'preview',
                title: node.store.data.data.label,
              },
            },
          });
        }
        break;
      case 'run':
        // 设置并运行
        // eslint-disable-next-line no-case-declarations
        const item = NewGraph.graph.toJSON().cells.find((i: any) => i.id === props.node.id);
        service
          .runOneJob({
            flowId: fileListModel.workflowData.key,
            flowName: fileListModel.workflowData.title,
            jobId: props.node.id,
            projectName: fileListModel.projectName,
            jobSet: JSON.stringify([
              {
                // 单个作业信息
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
              },
            ]),
          })
          .then((res: any) => {
            if (res) {
              if (res.success) {
                message.success('操作成功');
              } else {
                message.error(res.msg);
              }
            }
          });
        break;
      case 'stopRun':
        service.stopTaskRun({ id: props.node.id }).then((res: any) => {
          if (res) {
            if (res.success) {
              setTaskRunFlag(!!res?.data?.execid);
            } else {
              message.error(res.msg);
            }
          }
        });
        break;
      case 'codeSubmit':
        if (infoData?.status === 1) {
          // 取消代码提交
          service.jobCodeSubmitCancel({ id: infoData.id }).then((res: any) => {
            if (res) {
              if (res.success) {
                message.success('操作成功');
              } else {
                message.error(res.msg);
              }
            }
          });
        } else {
          console.log(infoData, 22)
          // 作业详情取sqlPath
          service.checkSqlContentCommitId({
            jobId: props.node.id,
          }).then((res: any)=>{
            if(res?.success){
              if(res.data){
                submitCode()
              }else{
                Modal.confirm({
                  title: '代码提交',
                  icon: <ExclamationCircleOutlined />,
                  content: <div style={{color: 'red'}}>经检测，对应生产代码文件已从平台之外被更改了，请谨慎提交！</div>,
                  okText: '取消',
                  cancelText: '仍然提交',
                  onOk() {
                  },
                  onCancel() {
                    submitCode()
                  },
                });
              }
            }
          })
        }
        break;
      case 'edit':
        // 触发获取操作区数据的方法
        getDvaApp()['_store'].dispatch({
          type: 'graphModel/setToJsonDate',
        });
        if (node.store.data.data.jobType === 2) {
          // 检查作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setAddTableJob',
            payload: {
              visible: true,
              data: { modalType: 'edit', modalId: props.node.id },
            },
          });
        } else if (node.store.data.data.jobType === 1) {
          // 普通作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setSqlJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'edit',
                title: node.store.data.data.label,
              },
            },
          });
        } else if (node.store.data.data.jobType === 3 || node.store.data.data.jobType === 4) {
          // script作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setScriptJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'edit',
              },
            },
          });
        } else if (node.store.data.data.jobType === 5) {
          // nonstd作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setNonstdJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'edit',
              },
            },
          });
        } else if (node.store.data.data.jobType === 7) {
          // spark作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setSparkJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'edit',
                title: node.store.data.data.label,
              },
            },
          });
        } else if (node.store.data.data.jobType === 8) {
          // MapReduce作业编辑默认值
          getDvaApp()['_store'].dispatch({
            type: 'sqlJobModel/setMapReduceJobModelData',
            payload: {
              visible: true,
              data: {
                id: props.node.id,
                type: 'edit',
                title: node.store.data.data.label,
              },
            },
          });
        }

        break;
      case 'compare':
        getDvaApp()['_store'].dispatch({
          type: 'graphModel/setCompareData',
          payload: {
            visible: true,
            data: {
              title: node.store.data.data.label,
              id: props.node.id,
            },
          },
        });
        break;
      case 'disable':
        nowFlowData = NewGraph.graph.toJSON().cells.map((i: any) => {
          if (i.shape === 'dag-edge') {
            return {
              id: i.id,
              source: i.source,
              target: i.target,
              zIndex: i.zIndex,
              shape: 'dag-edge',
            };
          }
          return {
            data: {
              ...i.data,
              flowId: i.flowId || i.data.flowId || i.data.tableInfo.flowId,
            },
            ports: i.ports.items,
            id: i.id,
            shape: 'dag-node',
            zIndex: i.zIndex,
            x: i.position.x,
            y: i.position.y,
            disabled: i?.disabled ?? false,
            closed: i?.closed ?? true,
          };
        });
        nowFlowData.forEach((i: any, y: number) => {
          // eslint-disable-next-line
          if (i.id == props.node.id) {
            nowFlowData[y].disabled = true;
          }
        });
        getDvaApp()['_store'].dispatch({
          type: 'fileListModel/setFlowData',
          payload: nowFlowData,
        });
        setJobDisable(!jobDisable);
        break;
      case 'cancelDisable':
        nowFlowData = NewGraph.graph.toJSON().cells.map((i: any) => {
          if (i.shape === 'dag-edge') {
            return {
              id: i.id,
              source: i.source,
              target: i.target,
              zIndex: i.zIndex,
              shape: 'dag-edge',
            };
          }
          return {
            data: {
              ...i.data,
              flowId: i.flowId || i.data.flowId || i.data.tableInfo.flowId,
            },
            ports: i.ports.items,
            id: i.id,
            shape: 'dag-node',
            zIndex: i.zIndex,
            x: i.position.x,
            y: i.position.y,
            disabled: i?.disabled ?? false,
            closed: i?.closed ?? true,
          };
        });
        nowFlowData.forEach((i: any, y: number) => {
          // eslint-disable-next-line
          if (i.id == props.node.id) {
            nowFlowData[y].disabled = false;
          }
        });
        getDvaApp()['_store'].dispatch({
          type: 'fileListModel/setFlowData',
          payload: nowFlowData,
        });
        setJobDisable(!jobDisable);
        break;
      default:
        break;
    }
  };

  const menu = (
    <Menu>
      {/* 除了虚拟作业 */}
      {node.store.data.data.jobType !== 6 && (
        <Menu.Item key="preview" onClick={() => rightClick('preview')}>
          查看
        </Menu.Item>
      )}
      {!currentFlowStatus && // 别人是否在编辑
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' && // 开发环境
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' && // 工作流处于编辑状态
        // TODO 生产临时关闭
        // node.store.data.data.jobType !== 6 &&
        // node.store.data.data.jobType !== 8 &&
        // node.store.data.data.jobType !== 7 && // 除了虚拟作业和mapReduce作业和spark作业
        node.store.data.data.jobType === 1 && // 生产上线暂时只开放sql作业可以运行
        !taskRunFlag && // 未运行状态
        !jobDisable && ( // 未禁用
          <Menu.Item key="run" onClick={() => rightClick('run')}>
            运行
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' &&
        // TODO 生产临时关闭
        // node.store.data.data.jobType !== 6 &&
        // node.store.data.data.jobType !== 8 &&
        // node.store.data.data.jobType !== 7 && // 除了虚拟作业和mapReduce作业和spark作业
        node.store.data.data.jobType === 1 && // 生产上线暂时只开放sql作业可以运行
        taskRunFlag &&
        !jobDisable && (
          <Menu.Item key="stopRun" onClick={() => rightClick('stopRun')}>
            停止运行
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        node.store.data.data.jobType !== 6 && // 除了虚拟作业
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' && (
          <Menu.Item key="edit" onClick={() => rightClick('edit')}>
            编辑
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        node.store.data.data.jobType !== 6 && // 除了虚拟作业
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' &&
        !jobDisable && (
          <Menu.Item key="disable" onClick={() => rightClick('disable')}>
            禁用
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        node.store.data.data.jobType !== 6 && // 除了虚拟作业
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' &&
        jobDisable && (
          <Menu.Item key="cancelDisable" onClick={() => rightClick('cancelDisable')}>
            解禁
          </Menu.Item>
        )}
      {/* 代码提交只针对普通作业 */}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        node.store.data.data.jobType === 1 && // 普通作业才有的操作
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' &&
        !jobDisable && ( // 未禁用
          <Menu.Item key="preview" onClick={() => rightClick('codeSubmit')}>
            {infoData?.status === 1 ? '取消代码提交' : '代码提交'}
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        node.store.data.data.jobType === 1 && // 普通sql作业才有的操作
        !jobDisable && ( // 未禁用
          <Menu.Item key="compare" onClick={() => rightClick('compare')}>
            版本比较
          </Menu.Item>
        )}
      {!currentFlowStatus &&
        getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' &&
        getDvaApp()['_store'].getState().fileListModel.workflowType === 'edit' && (
          <Menu.Item key="delete" onClick={() => rightClick('delete')}>
            移除作业
          </Menu.Item>
        )}
    </Menu>
  );

  // 获取当前节点详细信息
  const getInfo = (e: any) => {
    e.stopPropagation();
    // 非检查作业
    if (node.store.data.data.jobType !== 2) {
      if (!currentFlowStatus && getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev') {
        service.getJobInfo({ jobId: props.node.id }).then((res: any) => {
          if (res) {
            if (res.success) {
              setInfoData(res.data);
            } else {
              message.error(res.msg);
            }
          }
        });
      } else {
        service.getJobInfoPro({ jobId: props.node.id }).then((res: any) => {
          if (res) {
            if (res.success) {
              setInfoData(res.data);
            } else {
              message.error(res.msg);
            }
          }
        });
      }
    }
    service.getTaskRunStatus([{ id: props.node.id }]).then((res: any) => {
      if (res) {
        if (res.success) {
          setTaskRunFlag(!!res?.data.length);
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  const iconClick = (type: string) => {
    setCodeType(type);
    setCodeFlag(true);
  };

  const renderTitle = () => {
    if (props?.node?.id) {
      if (!currentFlowStatus && getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev') {
        return (
          <div className={styles.nodeInfo}>
            <span className={styles.title}>代码提交状态</span>
            <div className={styles.item} style={{ marginTop: '12px' }}>
              <span className={styles.key}>代码审批状态</span>
              <span className={styles.value}>{status[infoData?.status]}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.key}>提交人</span>
              <span className={styles.value}>{infoData?.insertby || '-'}</span>
            </div>
            <div className={styles.item}>
              <span className={styles.key}>提交时间</span>
              <span className={styles.value}>
                {infoData?.inserttime
                  ? moment(infoData.inserttime).format('YYYY-MM-DD HH:mm:ss')
                  : '-'}
              </span>
            </div>
            <div className={styles.item}>
              <span className={styles.key}>待提交代码</span>
              <FileSearchOutlined className={styles.icon} onClick={() => iconClick('code')} />
            </div>
            <div className={styles.item}>
              <span className={styles.key}>最近提交成功代码</span>
              <FileSearchOutlined className={styles.icon} onClick={() => iconClick('lately')} />
            </div>
            <div className={styles.item}>
              <span className={styles.key}>作业最新代码</span>
              <FileSearchOutlined className={styles.icon} onClick={() => iconClick('newCode')} />
            </div>
          </div>
        );
      }
      return (
        <div className={styles.nodeInfo}>
          <span className={styles.title}>代码状态</span>
          <div className={styles.item} style={{ marginTop: '12px' }}>
            <span className={styles.key}>提交人</span>
            <span className={styles.value}>{infoData?.insertby || '-'}</span>
          </div>
          <div className={styles.item}>
            <span className={styles.key}>提交时间</span>
            <span className={styles.value}>
              {infoData?.inserttime
                ? moment(infoData.inserttime).format('YYYY-MM-DD HH:mm:ss')
                : '-'}
            </span>
          </div>
          <div className={styles.item}>
            <span className={styles.key}>作业最新代码</span>
            <FileSearchOutlined className={styles.icon} onClick={() => iconClick('latelyNew')} />
          </div>
        </div>
      );
    }
    return null;
  };

  const onCancel = () => {
    setCodeFlag(false);
  };

  // 作业调度开关
  const switchChange = (e: any) => {
    const relativeInfo = props.node.store.data?.relative || '';
    const flowData = NewGraph.graph.toJSON().cells.map((i: any) => {
      if (i.shape === 'dag-edge') {
        return {
          id: i.id,
          source: i.source,
          target: i.target,
          zIndex: i.zIndex,
          shape: 'dag-edge',
        };
      }
      // eslint-disable-next-line
      if (i.id == props.node.id || (relativeInfo && relativeInfo === i?.relative)) {
        return {
          data: {
            ...i.data,
            flowId: i.flowId || i.data.flowId || i.data.tableInfo.flowId,
          },
          ports: i.ports.items,
          id: i.id,
          shape: 'dag-node',
          zIndex: i.zIndex,
          x: i.position.x,
          y: i.position.y,
          disabled: i?.disabled ?? false,
          closed: !e,
          relative: i?.relative || undefined,
        };
      }
      return {
        data: {
          ...i.data,
          flowId: i.flowId || i.data.flowId || i.data.tableInfo.flowId,
        },
        ports: i.ports.items,
        id: i.id,
        shape: 'dag-node',
        zIndex: i.zIndex,
        x: i.position.x,
        y: i.position.y,
        disabled: i?.disabled ?? false,
        closed: i?.closed ?? true,
        relative: i?.relative || undefined,
      };
    });
    setLoading(true);
    service
      .proJobSwitch({
        flowId: getDvaApp()['_store'].getState().fileListModel.workflowId,
        jobId: props.node.id,
        jobSet: JSON.stringify(flowData),
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setSwitchChecked(!e);
            getDvaApp()['_store'].dispatch({
              type: 'fileListModel/setFlowData',
              payload: flowData,
            });
            message.success('操作成功！');
          } else {
            message.error(res.msg);
          }
        }
        setLoading(false);
      });
  };

  const renderFlag = () => {
    if (getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev') {
      if (node.store.data.data.jobType !== 6) {
        return jobDisable;
      }
      return false;
    }
    if (node.store.data.data.jobType !== 6) {
      return jobDisable || switchChecked;
    }
    return switchChecked;
  };

  console.log(getDvaApp()['_store']?.getState()?.fileListMode?.workflowType, getDvaApp()['_store']?.getState()?.fileListMode?.workflowType === 'preview' ? true : jobDisable, 222323)

  return (
    <div className={styles.NodeItem} onMouseEnter={getInfo} key={node?.id}>
      <ContextMenu
        menu={
          (getDvaApp()['_store'].getState().fileListModel.tabKey !== 'dev' ||
            getDvaApp()['_store'].getState().fileListModel.workflowType !== 'edit') &&
          node.store.data.data.jobType === 6 ? (
            <span></span>
          ) : (
            menu
          )
        }
      >
        <Spin spinning={loading}>
          <div
            className={classNames({
              [styles.nodeClass]: true,
              [styles.disableClass]: renderFlag(),
            })}
          >
            {node.store.data.data.jobType === 2 && <TableJobIcon style={commonStyle} />}
            {node.store.data.data.jobType === 1 && (
              <Tooltip title={renderTitle}>
                <JobSqlIcon style={commonStyle} />
              </Tooltip>
            )}
            {(node.store.data.data.jobType === 3 || node.store.data.data.jobType === 4) && (
              <ScriptIcon style={{ color: '#9bc732', ...commonStyle, top: '9px' }} />
            )}
            {node.store.data.data.jobType === 5 && (
              <NonstdIcon style={{ color: '#da9832', ...commonStyle, top: '9px' }} />
            )}
            {node.store.data.data.jobType === 6 && (
              <VirtualJobIcon style={{ color: '#e0681f', ...commonStyle, top: '8px' }} />
            )}
            {node.store.data.data.jobType === 7 && (
              <SparkJobIcon style={{ ...commonStyle, color: '#cc3800' }} />
            )}
            {node.store.data.data.jobType === 8 && (
              <MapReduceJobIcon style={{ ...commonStyle, color: '#FF6A00' }} />
            )}

            {/* <Tooltip placement="top" title={node?.store?.data?.data.label}> */}
            {getDvaApp()['_store'].getState().fileListModel.tabKey === 'dev' ? (
              <span title={node?.store?.data?.data.label || ''} className={styles.nodeTitle}>
                {node?.store?.data?.data.label || ''}
              </span>
            ) : (
              <span
                title={
                  node?.store?.data?.data.label
                    ? node.store.data.data.label.replace('test_', '').replace('.sql', '')
                    : ''
                }
                className={styles.nodeTitle}
              >
                {node?.store?.data?.data.label
                  ? node.store.data.data.label.replace('test_', '').replace('.sql', '')
                  : ''}
              </span>
            )}
            {getDvaApp()['_store'].getState().fileListModel.tabKey !== 'dev' && // 生产模式
              node.store.data.data.jobType !== 6 && // 非虚拟可点
              NewGraph.nodeItemStatus !== 0 &&
              NewGraph.nodeItemStatus !== 3 && ( // 未调度
                // !jobDisable && // 未禁用
                <span className={styles.switch}>
                  <Switch
                    disabled={getDvaApp()['_store'].getState().fileListModel.workflowType === 'preview' || jobDisable}
                    size="small"
                    checked={!switchChecked}
                    onChange={switchChange}
                  />
                </span>
              )}
          </div>
        </Spin>
      </ContextMenu>
      {codeFlag && (
        <SubmitCode
          cancel={onCancel}
          codeFlag={codeFlag}
          codeType={codeType}
          id={props?.node?.id}
        />
      )}
    </div>
  );
};

export default NodeItem;
