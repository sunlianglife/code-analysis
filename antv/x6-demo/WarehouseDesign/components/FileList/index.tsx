import { DownOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { FileIcon, FileIconClose, WorkItemIcon } from '@/pages/DataDevelopment/icon';
import AddOrEdit from '@/pages/DataDevelopment/components/AddJob/addOrEdit';
import { Tree, Dropdown, Menu, Modal, message, Tooltip, Cascader } from 'antd';
import { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { useParams } from 'umi';
import { qiankunPush } from '@/utils/qiankunHistory';
import { connect } from 'dva';
import service from './service';
import type { EventDataNode } from 'antd/lib/tree';
import { NewGraph } from '../../MainContent/AntvDagContent/graph';
import DevModal from '@/components/DevModal';
import type { DefaultOptionType } from 'antd/es/cascader';

const FileList: React.FC<any> = (props: any) => {
  const {
    // dataLoading,
    fileList,
    dispatch,
    workflowId,
    workflowType,
    openData,
    currentFlowStatus,
  } = props;
  const [selectAllKey, setSelectAllKey] = useState<any>([]);
  const [visible, setVisible] = useState(false);
  const [treeDataType, setTreeDataType] = useState<any>([]);
  const [treeData, setTreeData] = useState<any>([]);
  const [searchTreeData, setSearchTreeData] = useState<any>([]); // 搜索之后的值
  const [rightClickItem, setRightClickItem] = useState<any>({});
  const [clickItem, setClickItem] = useState<any>({});
  const [quitVisible, setQuitVisible] = useState(false);
  const [modalType, setModalType] = useState('editWork');
  const [initFlag, setInitFlag] = useState(false);
  const timer = useRef<any>();
  const { projectId } = useParams<any>();

  // 数据展开为一级
  const handleData = (data: any, list?: any) => {
    const dataList: any = list || [];
    data.forEach((i: any) => {
      const item: any = { ...i };
      if(i.type === 2){
        item.children = []
      }
      dataList.push(item);
      if (i.type === 1 && i.children && i.children.length) {
        handleData(i.children, dataList);
      }
    });
    return dataList;
  };

  /**
   * 递归处理数据
   * 因为搜索框下拉数据和tree列表的数据是一个接口的
   * 所以tree组件这里特殊处理一下，将type为2即工作流的时候置空children
   * @param data
   * @returns
   */
  const handleTreeData = (data: any) => {
    const dataList: any = [];
    data.forEach((i: any) => {
      const item: any = { ...i };
      if(i.type === 2){
        item.children = []
      }
      if (i.type === 1 && i.children && i.children.length) {
        item.children = handleTreeData(i.children);
      }
      dataList.push(item);
    });
    return dataList;
  };

  useEffect(() => {
    if (Number(projectId)) {
      dispatch({
        type: 'fileListModel/fetchById',
        payload: { id: projectId },
      });
      timer.current = setInterval(() => {
        // 根据工作流的id查询 list
        dispatch({
          type: 'fileListModel/fetchById',
          payload: { id: projectId },
        });
      }, 5000);
    } else {
      qiankunPush('/project/development/index/warehouseDesign/entry');
      clearInterval(timer.current);
    }
    return () => {
      clearInterval(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    setTreeDataType(handleData(fileList));
    setTimeout(() => {
      const data = handleTreeData(fileList)
      setTreeData(data);
      setSearchTreeData(data);
    }, 0);
    // 树形数据展开为一级 方便遍历层级数据
    dispatch({
      type: 'fileListModel/setOpenData',
      payload: handleData(fileList),
    });
    // if (!selectAllKey.length && fileList.length) {
    if (fileList.length) {
      setTimeout(() => {
        if (!initFlag) {
          setInitFlag(true);
          setSelectAllKey([fileList[0].key]);
        }
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileList]);

  useEffect(() => {
    if (workflowId && openData) {
      // 刷新工作流重命名之后的数据
      dispatch({
        type: 'fileListModel/setWorkflowId',
        payload: {
          workflowId,
          workflowData: openData.find((i: any) => i.key === workflowId),
        },
      });
    }
  }, [openData]);

  // 节点点击
  const treeOnSelect = (_: any, node: any) => {
    // 文件夹节点
    if (node?.node?.type === 1) {
      if (selectAllKey.findIndex((item: any) => item === node.node.key) > -1) {
        const data = selectAllKey;
        data.splice(
          selectAllKey.findIndex((item: any) => item === node.node.key),
          1,
        );
        setSelectAllKey([...data]);
      } else {
        setSelectAllKey([...selectAllKey, node.node.key]);
      }
      // eslint-disable-next-line
    } else if (
      // eslint-disable-next-line
      node.node.key != workflowId &&
      // eslint-disable-next-line
      workflowId != '0' &&
      // eslint-disable-next-line
      workflowType !== 'preview' &&
      !currentFlowStatus
    ) {
      // 不是当前工作流&&已选中工作流&&当前工作流不为预览状态&&当前工作流是不是别人在编辑
      const clickData = treeDataType.find((i: any) => i.key === node.node.key);
      setClickItem(clickData);
      setQuitVisible(true);
      // eslint-disable-next-line eqeqeq
    } else if (workflowId == '0' || workflowType === 'preview' || currentFlowStatus) {
      // 未选择工作流||正在预览工作流||当前工作流正在被别人编辑
      const clickData = treeDataType.find((i: any) => i.key === node.node.key);
      setClickItem(clickData);
      // 设置查看的工作流id
      dispatch({
        type: 'fileListModel/setWorkflowId',
        payload: {
          workflowId: clickData?.type === 1 ? 0 : clickData.key,
          workflowData: clickData?.type === 1 ? undefined : clickData,
        },
      });
      dispatch({
        type: 'fileListModel/setTabKey',
        payload: 'dev',
      });
      // 查询当前工作流的操作区数据
      dispatch({
        type: 'fileListModel/getFlowById',
        payload: {
          id: node.node.key,
        },
      });
      // 预览工作流
      dispatch({
        type: 'fileListModel/setWorkflowType',
        payload: 'preview',
      });
    }
  };

  // 工作流删除
  const onConfirm = () => {
    service.deleteFileOrWork({ id: rightClickItem.key }).then((res: any) => {
      if (res) {
        if (res.success) {
          message.success('操作成功');
          dispatch({
            type: 'fileListModel/fetchById',
            payload: { id: projectId },
          });
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
            payload: { id: projectId },
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

  // 编辑工作流
  const editJob = () => {
    if (workflowId && workflowId !== rightClickItem.key && workflowType === 'edit') {
      message.error('请先保存工作流并退出编辑!');
      return;
    }
    service
      .checkEdit({
        id: rightClickItem.key,
      })
      .then((res: any) => {
        if (res?.msg === '请求成功') {
          if (rightClickItem?.type === 2) {
            // 根据工作流的id查询job作业
            dispatch({
              type: 'fileListModel/getJobList',
              payload: {
                flowId: rightClickItem.key,
              },
            });
            // 编辑工作流
            dispatch({
              type: 'fileListModel/setWorkflowType',
              payload: 'edit',
            });
          }
          dispatch({
            type: 'fileListModel/setCurrentFlowStatus',
            payload: false,
          });
        } else {
          message.error(res.msg);
          // 如果此时操作的工作流是否正在被别人编辑
          dispatch({
            type: 'fileListModel/setCurrentFlowStatus',
            payload: true,
          });
        }
        if (rightClickItem?.type === 2) {
          // 查询当前工作流的操作区数据
          dispatch({
            type: 'fileListModel/getFlowById',
            payload: {
              id: rightClickItem.key,
            },
          });
        }
        // 所选中工作流的id
        dispatch({
          type: 'fileListModel/setWorkflowId',
          payload: {
            workflowId: rightClickItem?.type === 1 ? 0 : rightClickItem.key,
            workflowData: rightClickItem?.type === 1 ? undefined : rightClickItem,
          },
        });
      });
  };

  // 检查文件夹下是否有工作流
  const checkIncludeFlow = (item: any) => {
    let flag = false;
    if (item && item.key) {
      if (item.children && item.children.length) {
        item.children.forEach((i: any) => {
          flag = checkIncludeFlow(i);
        });
      } else if (item.type === 2) {
        flag = true;
      } else {
        flag = false;
      }
    }
    return flag;
  };

  const menu = (
    <Menu>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          editJob();
        }}
      >
        <span>编辑工作流</span>
      </Menu.Item>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          setModalType('editWork');
          setVisible(true);
        }}
      >
        <a>设置</a>
      </Menu.Item>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          if (rightClickItem.status !== 0) {
            message.error('只允许删除未上线的工作流！');
            return;
          }
          Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: '是否确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => onConfirm(),
          });
        }}
      >
        <a>删除</a>
      </Menu.Item>
    </Menu>
  );

  const menuFile = (
    <Menu>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          setModalType('editFile');
          setVisible(true);
        }}
      >
        <span>重命名</span>
      </Menu.Item>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          setModalType('addFileC');
          setVisible(true);
        }}
      >
        <a>新建子文件夹</a>
      </Menu.Item>
      <Menu.Item
        onClick={(e: any) => {
          e.domEvent.stopPropagation();
          Modal.confirm({
            icon: <ExclamationCircleOutlined />,
            content: '是否确认删除？',
            okText: '确认',
            cancelText: '取消',
            onOk: () => {
              const item = openData.find((i: any) => i.key === rightClickItem.key);
              if (checkIncludeFlow(item)) {
                message.error('存在工作流，不可删除！');
                return;
              }
              service.deleteFileOrWork({ id: rightClickItem.key }).then((res: any) => {
                if (res) {
                  if (res.success) {
                    // 重新查询fileList
                    dispatch({
                      type: 'fileListModel/fetchById',
                      payload: { id: projectId },
                    });
                  }
                }
              });
            },
          });
        }}
      >
        <a>删除</a>
      </Menu.Item>
    </Menu>
  );

  /**
   *
   * @param a 节点信息整条数据
   * @returns
   */
  const titleRender = (value: any = {}) => {
    const item = treeDataType.find((i: any) => i.key === value.key);
    if (item && item.type === 1) {
      if (selectAllKey.includes(value.key)) {
        return (
          <Dropdown overlay={menuFile} placement="bottomCenter" trigger={['contextMenu']}>
            <div
              className={styles.renderTitle}
              // style={workflowId == value.key ? {color: '#fff'} : {color: '#7B7B7B'}}
            >
              <span>
                <FileIcon />
              </span>
              <span className={styles.title}>{value.title}</span>
            </div>
          </Dropdown>
        );
      }
      return (
        <Dropdown overlay={menuFile} placement="bottomCenter" trigger={['contextMenu']}>
          <div
            className={styles.renderTitle}
            // style={selectKey.includes(a.key) ? {color: '#fff'} : {color: '#000'}}
          >
            <span>
              <FileIconClose />
            </span>
            <span className={styles.title}>{value.title}</span>
          </div>
        </Dropdown>
      );
    }
    return (
      <Dropdown overlay={menu} placement="bottomCenter" trigger={['contextMenu']}>
        <div
          className={styles.renderTitle}
          style={
            // eslint-disable-next-line eqeqeq
            workflowId == value.key
              ? { color: '#fff', background: '#38CCB5' }
              : { color: '#7B7B7B', background: '#fff' }
          }
        >
          <span>
            <WorkItemIcon style={{ paddingTop: '2px' }} />
          </span>
          <span className={styles.title} style={{ fontSize: '13px', fontWeight: 400 }}>
            {value.title}
          </span>
          {value.type === 2 && value.lockBy && (
            <Tooltip title={`${value.lockBy}正在编辑此工作流!`} color="#1496db" key="#1496db">
              <span className={styles.signFalse}></span>
            </Tooltip>
          )}
        </div>
      </Dropdown>
    );
  };

  const onExpand = (a: any, b: any) => {
    treeOnSelect(a, b);
  };

  // 重命名取消
  const onCancel = () => {
    setVisible(false);
  };

  // 重命名保存
  const onFinish = (values: any) => {
    if (values.id) {
      service.editFileOrWorkFlow(values).then((res: any) => {
        if (res) {
          if (res.success) {
            message.success('操作成功');
            onCancel();
            dispatch({
              type: 'fileListModel/fetchById',
              payload: { id: projectId },
            });
            if (workflowId && workflowType === 'edit') {
              // 根据工作流的id查询job作业
              dispatch({
                type: 'fileListModel/getJobList',
                payload: {
                  flowId: workflowId,
                },
              });
              // 查询操作区数据
              dispatch({
                type: 'fileListModel/getFlowById',
                payload: {
                  id: workflowId,
                },
              });
            }
          } else {
            message.error(res.msg);
          }
        }
      });
    } else {
      service.addFileOrWorkFlow(values).then((res: any) => {
        if (res) {
          if (res.success) {
            message.success('操作成功');
            onCancel();
            dispatch({
              type: 'fileListModel/fetchById',
              payload: { id: projectId },
            });
          } else {
            message.error(res.msg);
          }
        }
      });
    }
  };

  // 右键选中的工作流
  const onRightClick = (info: { event: any; node: EventDataNode }) => {
    setRightClickItem(treeDataType.find((i: any) => i.key === info.node.key));
  };

  // 点击切换工作流
  const switchFlow = () => {
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
    service.saveData(params).then((res: any) => {
      if (res) {
        if (res.success) {
          dispatch({
            type: 'graphModel/setSaveData',
            payload: {
              date: 0,
              data: {},
            },
          });
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
          // 收起作业列表
          dispatch({
            type: 'fileListModel/setShrinkTime',
            payload: new Date().getTime(),
          });
          // 退出
          service
            .editQuit({
              id: workflowId,
            })
            .then((resp: any) => {
              if (resp) {
                if (resp.success) {
                  setQuitVisible(false);
                  // 设置查看的工作流id
                  dispatch({
                    type: 'fileListModel/setWorkflowId',
                    payload: {
                      workflowId: clickItem?.type === 1 ? 0 : clickItem.key,
                      workflowData: clickItem?.type === 1 ? undefined : clickItem,
                    },
                  });
                  // 预览工作流
                  dispatch({
                    type: 'fileListModel/setWorkflowType',
                    payload: 'preview',
                  });
                  // 查询当前工作流的操作区数据
                  dispatch({
                    type: 'fileListModel/getFlowById',
                    payload: {
                      id: clickItem.key,
                    },
                  });
                } else {
                  message.error(resp.msg);
                }
              }
            });
        } else {
          message.error(res.msg);
        }
      }
      dispatch({
        type: 'fileListModel/setTabKey',
        payload: 'dev',
      });
    });
  };

  const filter = (inputValue: string, path: DefaultOptionType[]) =>
  path.some(
    option => (option.label as string).toLowerCase().indexOf(inputValue.toLowerCase()) > -1,
  );

  const searchTree = (search: any, list: any = []) => {
    const dataList: any = []
    list.forEach((i: any)=>{
      if(search.includes(String(i.key))){
        const item = {...i}
        if (i.type === 2) {
          dataList.push(item)
        }else if(i.type === 1){
          item.children = searchTree(search, i.children)
          dataList.push(item)
        }
      }
    })
    return dataList
  }

  const onChange = (value: any, selectedOptions: any) => {
    const option: any = []
    selectedOptions.reverse().forEach((item: any) => {
      if(item.key !== 3 && item.key !== 4){
        option.push(item)
      }
    });
    option.reverse()
    setSelectAllKey(option.map((item: any)=>item.key))
    if(option.length){
      treeOnSelect({},{node: option[option.length-1]})
    }
  }

  return (
    <div className={styles.DFileList}>
      {/* <Spin spinning={dataLoading}> */}
      <Cascader
        options={fileList}
        onChange={onChange}
        // placeholder="Please select"
        changeOnSelect
        showSearch={{ filter }}
        expandTrigger="hover"
        onSearch={value => console.log(value)}
        style={{marginLeft: '20px', marginTop: '10px'}}
      />
      <Tree
        expandedKeys={selectAllKey}
        onSelect={treeOnSelect}
        treeData={searchTreeData}
        // selectedKeys={selectKey}
        style={{ marginTop: '6px' }}
        titleRender={titleRender}
        switcherIcon={<DownOutlined />}
        onRightClick={onRightClick}
        onExpand={onExpand}
      />
      {visible && (
        <AddOrEdit
          textType={modalType}
          reNameData={rightClickItem}
          onCancelModal={onCancel}
          onFinishModal={onFinish}
          visible={visible}
        />
      )}
      {quitVisible && (
        <DevModal
          visible={quitVisible}
          forceRender
          title="切换工作流"
          okText="确定"
          cancelText="取消"
          width="450px"
          onCancel={() => {
            setQuitVisible(false);
          }}
          onOk={() => {
            switchFlow();
            // 生产开发环境的key
            dispatch({
              type: 'fileListModel/setTabKey',
              payload: 'dev',
            });
          }}
          closable={false}
          centered
        >
          <div>请确认是否需要保存当前工作流并退出编辑</div>
        </DevModal>
      )}
      {/* </Spin> */}
    </div>
  );
};

export default connect(({ fileListModel }: { fileListModel: any }) => ({
  fileList: fileListModel.fileList,
  dataLoading: fileListModel.dataLoading,
  currentFlowStatus: fileListModel.currentFlowStatus,
  openData: fileListModel.openData,
  workflowId: fileListModel.workflowId,
  workflowType: fileListModel.workflowType,
}))(FileList);
