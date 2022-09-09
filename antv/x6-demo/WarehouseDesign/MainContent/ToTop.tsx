import styles from './index.less';
import {
  SearchMapIcon,
  RefreshIcon,
  FocusIcon,
  EnlargeIcon,
  NarrowIcon,
  // SetAddRunIcon,
  ReductionIcon,
  SubmitProIcon,
  RunResultIcon,
  QuitIcon,
  SaveIcon,
  StopRunIcon,
} from '@/pages/DataDevelopment/icon';
import { connect } from 'dva';
import { message, Spin, Tooltip } from 'antd';
import NewModal from '@/components/DevModal';
import service from './service';
import { NewGraph } from './AntvDagContent/graph';
import SelectM from '@/components/Select';
import { useEffect, useRef, useState } from 'react';

const ToTop: React.FC<any> = ({ dispatch, fileListModel, saveData, currentJSONData }) => {
  const timer = useRef<any>();
  const [visible, setVisible] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [runExecid, setRunExecid] = useState(0);
  const [searchData, setSearchData] = useState<any>([]); // 搜索下拉框的数据

  const onHandleSideToolbar = (key: string) => {
    dispatch({
      type: 'graphModel/setGraphOperation',
      payload: key,
    });
  };

  const getFlowRunStatus = () => {
    service.getFlowRunStatus({ id: fileListModel.workflowId }).then((res: any) => {
      if (res) {
        if (res.success) {
          setRunExecid(res?.data?.execid || 0);
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  // 五秒钟保存一次
  useEffect(() => {
    if (!fileListModel.currentFlowStatus && fileListModel.workflowType === 'edit') {
      timer.current = setInterval(() => {
        if (NewGraph?.graph?.toJSON) {
          const data = NewGraph.graph.toJSON().cells;
          const params = {
            id: fileListModel.workflowId,
            jobSet: JSON.stringify(
              data.map((item: any) => {
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
                console.log('');
              } else {
                message.error(res.msg);
              }
            }
          });
        }
        getFlowRunStatus();
      }, 5000);
    } else {
      clearInterval(timer.current);
    }
    return () => {
      clearInterval(timer.current);
    };
  }, [fileListModel.workflowType]);

  // 提交至生产
  const submitProLa = () => {
    // 保存
    if (NewGraph?.graph?.toJSON) {
      const data = NewGraph.graph.toJSON().cells;
      if (!data?.length) return;
      const params = {
        id: fileListModel.workflowId,
        jobSet: JSON.stringify(
          data.map((item: any) => {
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
      setLoading(true);
      service.saveData(params).then((res: any) => {
        if (res) {
          if (res.success) {
            service.getSubmitData({ id: fileListModel.workflowId }).then((resp: any) => {
              if (resp) {
                if (resp.success) {
                  // 打开弹框
                  dispatch({
                    type: 'graphModel/setSubmitToProductionData',
                    payload: {
                      visible: true,
                      data: {},
                    },
                  });
                } else {
                  message.error(resp.msg);
                }
              }
              setLoading(false);
            });
          } else {
            message.error(res.msg);
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      });
    }
  }

  const iconClick = async (key: string) => {
    // 触发获取操作区数据的方法
    await dispatch({
      type: 'graphModel/setToJsonDate',
    });
    switch (key) {
      case 'setRun':
        if (NewGraph?.graph?.toJSON) {
          const data = NewGraph.graph.toJSON().cells;
          if (!data?.length) return;
          const params = {
            id: fileListModel.workflowId,
            jobSet: JSON.stringify(
              data.map((item: any) => {
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
          setLoading(true);
          service.saveData(params).then((res: any) => {
            if (res) {
              if (res.success) {
                service.getSubmitData({ id: fileListModel.workflowId }).then((resp: any) => {
                  if (resp) {
                    if (resp.success) {
                      dispatch({
                        type: 'graphModel/setSetRunData',
                        payload: {
                          visible: true,
                          data: {},
                        },
                      });
                    } else {
                      message.error(resp.msg);
                    }
                  }
                  setLoading(false);
                });
              } else {
                message.error(res.msg);
                setLoading(false);
              }
            } else {
              setLoading(false);
            }
          });
        }
        break;
      case 'stopRun':
        setLoading(true);
        service.stopFlowRunStatus({ id: fileListModel.workflowId }).then((res: any) => {
          if (res) {
            if (res.success) {
              getFlowRunStatus();
            } else {
              message.error(res.msg);
            }
          }
          setLoading(false);
        });
        break;
      case 'result':
        dispatch({
          type: 'graphModel/setRunResultData',
          payload: {
            visible: true,
            type: 'dev',
            data: {},
          },
        });
        break;
      case 'submitPro':
        submitProLa()
        break;
      case 'reductionPro':
        service.reductionPro({ id: fileListModel.workflowId }).then((res: any) => {
          if (res) {
            if (res.success) {
              message.success('操作成功');
              // 根据工作流的id查询job作业
              dispatch({
                type: 'fileListModel/getJobList',
                payload: {
                  flowId: fileListModel.workflowId,
                },
              });
              // 查询当前工作流的操作区数据
              dispatch({
                type: 'fileListModel/getFlowById',
                payload: {
                  id: fileListModel.workflowId,
                },
              });
              dispatch({
                type: 'graphModel/getFlowStatus',
                payload: { flowId: fileListModel.workflowId },
              });
            } else {
              message.error(res.msg);
            }
          }
        });
        break;
      case 'search':
        // scrollToPoint 使用 antv x6 的这个方法
        break;
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
      case 'save':
        setSaveVisible(true);
        break;
      case 'quit':
        // eslint-disable-next-line @typescript-eslint/no-use-before-define
        save(true);
        setVisible(true);
        break;
      default:
        break;
    }
  };

  // 退出
  const quit = () => {
    service
      .editQuit({
        id: fileListModel.workflowId,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            message.success('操作成功');
            setVisible(false);
            // 销毁画布中的元素
            dispatch({
              type: 'fileListModel/setFlowData',
              payload: [],
            });
            // 清空操作区JSON
            dispatch({
              type: 'graphModel/setCurrentJSONData',
              payload: [],
            });
            // 清空工作流id
            dispatch({
              type: 'fileListModel/setWorkflowId',
              payload: {
                workflowId: 0,
                workflowData: null,
              },
            });
            // 重新查询fileList
            dispatch({
              type: 'fileListModel/fetchById',
              payload: { id: fileListModel.projectId },
            });
            // 收起作业列表
            dispatch({
              type: 'fileListModel/setShrinkTime',
              payload: new Date().getTime(),
            });
          } else {
            message.error(res.msg);
          }
        }
      });
  };

  const save = (flag?: boolean) => {
    // 与操作区参数相关的保存-保存
    const params = {
      id: fileListModel.workflowId,
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
              flowId: item?.flowId || item?.data?.flowId || item?.data?.tableInfo?.flowId,
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
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          !flag && message.success('操作成功');
          setSaveVisible(false);
          dispatch({
            type: 'graphModel/setSaveData',
            payload: {
              date: 0,
              data: {},
            },
          });
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  useEffect(() => {
    // 添加检查作业触发保存
    if (saveData.date) {
      save(true);
    }
  }, [saveData.date]);

  useEffect(()=>{
    if(currentJSONData?.length > 0) {
      setSearchData(
        currentJSONData
          .filter((item: any) => item.shape === 'dag-node')
          .map((item: any) => ({id: item.id, label: item.data.label}))
      )
    }
  }, [currentJSONData])

  return (
    <div className={styles.toTop}>
      <Spin spinning={loading}>
        <div className={styles.left}>
          {/* TODO 生产临时关闭 */}
          {/* 生产上线暂不开放设置并运行 */}
          {/* {!fileListModel.currentFlowStatus && fileListModel.workflowType === 'edit' && !runExecid && (
            <div className={styles.contentIcon} onClick={() => iconClick('setRun')}>
              <SetAddRunIcon style={{ verticalAlign: 'middle' }} />
              <span className={styles.title}>设置并运行</span>
            </div>
          )} */}
          {!fileListModel.currentFlowStatus &&
            fileListModel.workflowType === 'edit' &&
            !!runExecid && (
              <div className={styles.contentIcon} onClick={() => iconClick('stopRun')}>
                <StopRunIcon style={{ verticalAlign: 'middle' }} />
                <span className={styles.title}>停止运行</span>
              </div>
            )}
          <div className={styles.contentIcon} onClick={() => iconClick('result')}>
            <RunResultIcon style={{ verticalAlign: 'middle' }} />
            <span className={styles.title}>运行结果</span>
          </div>
          {!fileListModel.currentFlowStatus && fileListModel.workflowType === 'edit' && (
            <div className={styles.contentIcon} onClick={() => iconClick('submitPro')}>
              <SubmitProIcon style={{ verticalAlign: 'middle' }} />
              <span className={styles.title}>提交至生产</span>
            </div>
          )}
          {!fileListModel.currentFlowStatus && fileListModel.workflowType === 'edit' && (
            <div className={styles.contentIcon} onClick={() => iconClick('reductionPro')}>
              <ReductionIcon style={{ verticalAlign: 'middle' }} />
              <span className={styles.title}>还原为生产</span>
            </div>
          )}
          {!fileListModel.currentFlowStatus && fileListModel.workflowType === 'edit' && (
            <div
              className={styles.contentIcon}
              style={{ width: '55px' }}
              onClick={() => iconClick('save')}
            >
              <SaveIcon style={{ verticalAlign: 'middle' }} />
              <span className={styles.title}>保存</span>
            </div>
          )}
          {fileListModel.workflowType === 'edit' && (
            <div className={styles.contentIcon} onClick={() => iconClick('quit')}>
              <QuitIcon style={{ verticalAlign: 'middle' }} />
              <span className={styles.title}>退出编辑</span>
            </div>
          )}
          {/* TODO 一期隐藏搜索作业-开发 */}
          <div className={styles.contentIcon} style={{display: 'flex', alignItems: 'center'}} onClick={() => iconClick('search')}>
            <SearchMapIcon style={{ verticalAlign: 'middle' }} />
            <SelectM
              showSearch
              labelInValue
              placeholder="请选择"
              optionlist={searchData}
              style={{width: '200px'}}
              labelkey="id"
              allowClear
              onFocus={()=>{
                // 触发获取操作区数据的方法
                dispatch({
                  type: 'graphModel/setToJsonDate',
                });
              }}
              onChange={(value)=>{
                // 触发获取操作区数据的方法
                dispatch({
                  type: 'graphModel/setSearchId',
                  payload: value?.key || 0,
                });
              }}
              label="label"
            />
          </div>
        </div>
      </Spin>
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
      {visible && (
        <NewModal
          visible={visible}
          forceRender
          title="退出编辑"
          okText="退出"
          cancelText="取消"
          width="550px"
          onCancel={() => setVisible(false)}
          onOk={() => quit()}
          destroyOnClose
          closable={false}
          centered
        >
          <div>建议保持工作流依赖结构正确，再选择退出！</div>
        </NewModal>
      )}
      {saveVisible && (
        <NewModal
          visible={saveVisible}
          forceRender
          title="保存"
          okText="确定"
          cancelText="取消"
          width="450px"
          onCancel={() => setSaveVisible(false)}
          onOk={() => save()}
          destroyOnClose
          closable={false}
          centered
        >
          <div>请确认是否需要保存</div>
        </NewModal>
      )}
    </div>
  );
};

export default connect(
  ({ fileListModel, graphModel }: { fileListModel: any; graphModel: any }) => ({
    fileListModel,
    currentJSONData: graphModel.currentJSONData,
    saveData: graphModel.saveData,
  }),
)(ToTop);
