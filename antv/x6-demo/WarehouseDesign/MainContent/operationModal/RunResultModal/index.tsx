import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { DatePicker, Form, message, Radio, Badge, Spin } from 'antd';
import { useEffect, useRef, useState } from 'react';
import { LogIcon, DateIcon } from '@/pages/DataDevelopment/icon';
import MyTable from '@/components/CommonTable';
import Pagination from '@/pages/DataDevelopment/components/Pagination';
import styles from './index.less';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import moment from 'moment';
import service from '../../../api/service';
import { FileSearchOutlined } from '@ant-design/icons';
import Logs from './log';
import DevButton from '@/components/DevButton';
import SelectM from '@/components/Select';

export const azStatusC = {
  10: '调度中',
  15: '调度中',
  20: '准备中',
  30: '运行中',
  40: '暂停',
  50: '成功',
  55: '杀死中',
  60: '已杀死',
  65: '执行已停止',
  70: '失败',
  80: '结束_结束中',
  90: '跳过',
  100: '禁用',
  110: '队列',
  120: '失败_成功',
  125: '已取消',
};

export const azStatus = {
  10: 'Ready',
  15: 'Dispatching',
  20: 'Preparing',
  30: 'Running',
  40: 'Paused',
  50: 'Succeeded',
  55: 'Killing',
  60: 'Killed',
  65: 'Execution_Stopped',
  70: 'Failed',
  80: 'Failed_Finishing',
  90: 'Skipped',
  100: 'Disabled',
  110: 'Queued',
  120: 'Failed_Succeeded',
  125: 'Cancelled',
};

const RunResultModal: React.FC<any> = (props) => {
  const { dispatch, runResultData, workflowId, workflowData } = props;
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const [form] = Form.useForm();
  const [dataList, setDataList] = useState({
    items: [],
    total: 0,
  });
  const [searchParams, setSearchParams] = useState<any>({
    current: 1,
    pageSize: 10,
    startTime: new Date(`${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`).getTime(),
    endTime: new Date(`${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`).getTime(),
  });
  const [listInfo, setListInfo] = useState<any>({});
  const [loadingInfo, setLoadingInfo] = useState(false);
  const [clickItem, setClickItem] = useState<any>({});
  const [logFlag, setLogFlag] = useState<any>(false);
  const [currentRecord, setCurrentRecord] = useState<any>({});
  const [logType, setLogType] = useState('job');
  const [loadingList, setLoadingList] = useState(false);
  const [historyFlow, setHistoryFlow] = useState<any>([]);

  const columns: ProColumns<any>[] = [
    {
      title: '作业名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '作业类型',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: '执行引擎',
      dataIndex: 'engine',
      key: 'engine',
    },
    {
      title: '开始时间-结束时间',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      key: 'result',
      render: (value: any) => <span>{azStatus[value]}</span>,
    },
    {
      title: '运行时长(s)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '操作',
      dataIndex: 'name',
      key: 'name',
      render: (value: any, record: any) => {
        return (
          <div
            className={styles.rowLog}
            onClick={() => {
              setCurrentRecord(record);
              setLogType('job');
              setLogFlag(true);
            }}
          >
            <FileSearchOutlined style={{ color: '#38CCB5' }} />
            <span>作业日志</span>
          </div>
        );
      },
    },
  ];

  const columnsPro: ProColumns<any>[] = [
    {
      title: '作业名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '开始时间-结束时间',
      dataIndex: 'timeRange',
      key: 'timeRange',
    },
    {
      title: '执行结果',
      dataIndex: 'result',
      key: 'result',
      render: (value: any) => <span>{azStatus[value]}</span>,
    },
    {
      title: '运行时长(s)',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: '操作',
      dataIndex: 'name',
      key: 'name',
      render: (value: any, record: any) => {
        return (
          <div
            className={styles.rowLog}
            onClick={() => {
              setCurrentRecord(record);
              setLogType('job');
              setLogFlag(true);
            }}
          >
            <FileSearchOutlined style={{ color: '#38CCB5' }} />
            <span>作业日志</span>
          </div>
        );
      },
    },
  ];

  // 获取历史工作流
  const getHistoryWorkflow = () => {
    service.getHistoryWorkflow({ flowId: workflowId }).then((res: any) => {
      if (res) {
        if (res.success) {
          setHistoryFlow(res.data.map((item: any) => ({ id: item, name: item })));
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setRunResultData',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  useEffect(() => {
    setSearchParams({
      ...searchParams,
      flowId: workflowId,
      flowName: runResultData.type === 'pro' ? workflowData.title : undefined,
    });
    getHistoryWorkflow();
  }, []);

  const getList = () => {
    if (searchParams.flowId && searchParams.startTime && searchParams.endTime) {
      setLoadingList(true);
      if (runResultData.type === 'pro') {
        service
          .getResultProList({
            ...searchParams,
          })
          .then((res: any) => {
            if (res) {
              if (res.success) {
                setDataList(res.data);
              } else {
                message.error(res.msg);
              }
            }
            setLoadingList(false);
          });
      } else {
        service.getResultList(searchParams).then((res: any) => {
          if (res) {
            if (res.success) {
              setDataList(res.data);
            } else {
              message.error(res.msg);
            }
          }
          setLoadingList(false);
        });
      }
    }
  };

  useEffect(() => {
    getList();
  }, [searchParams]);

  const dateChangeStart = (date: any, dateString: string) => {
    if (dateString) {
      setSearchParams({
        ...searchParams,
        startTime: new Date(dateString).getTime(),
      });
    }
  };

  const dateChangeEnd = (date: any, dateString: string) => {
    if (dateString) {
      setSearchParams({
        ...searchParams,
        endTime: new Date(dateString).getTime(),
      });
    }
  };

  const onChangeP = (num: number) => {
    setSearchParams({
      ...searchParams,
      current: num,
    });
  };

  const listClick = (item: any) => {
    setLoadingInfo(true);
    setClickItem(item);
    service
      .getResultListInfo({
        flowId: workflowId,
        execId: item.execId,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setListInfo(res.data);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          } else {
            message.error(res.msg);
          }
        }
        setLoadingInfo(false);
      });
  };

  const refreshList = () => {
    getList();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    clickItem?.execId && listClick(clickItem);
  };

  const flowNameChange = (value: any) => {
    setSearchParams({
      ...searchParams,
      flowName: value.value,
    });
    setListInfo({});
    if (actionRef.current) {
      actionRef.current.reload();
    }
  };

  return (
    <div>
      {runResultData.visible && (
        <Modal
          visible={runResultData.visible}
          forceRender
          // confirmLoading={loading}
          width="940px"
          bodyStyle={{ height: '740px' }}
          onCancel={onCancel}
          onOk={() => form.submit()}
          destroyOnClose
          footer={null}
          centered
          className={styles.runResultModal}
          enlarge // 放大icon
        >
          <div className={styles.content}>
            <section className={styles.left}>
              <div className={styles.search}>
                <span className={styles.title}>筛选（按开始时间）</span>
                <DevButton type="primary" onClick={refreshList} style={{ marginLeft: '20px' }}>
                  刷新
                </DevButton>
                <Form
                  form={form}
                  preserve={false}
                  initialValues={{
                    startTime: moment(`${moment(new Date()).format('YYYY-MM-DD')} 00:00:00`),
                    endTime: moment(`${moment(new Date()).format('YYYY-MM-DD')} 23:59:59`),
                    flowName: {
                      key: workflowData?.title,
                      value: workflowData?.title,
                      label: workflowData?.title,
                    },
                  }}
                >
                  <Form.Item name="startTime" style={{ width: '100%', marginTop: '14px' }}>
                    <DatePicker
                      style={{ width: '100%', height: '32px' }}
                      onChange={dateChangeStart}
                      suffixIcon={<DateIcon />}
                      showTime
                    />
                  </Form.Item>
                  <Form.Item name="endTime" style={{ width: '100%' }}>
                    <DatePicker
                      style={{ width: '100%', height: '32px' }}
                      onChange={dateChangeEnd}
                      suffixIcon={<DateIcon />}
                      showTime
                    />
                  </Form.Item>
                  {runResultData.type === 'pro' && (
                    <Form.Item
                      name="flowName"
                      // rules={[{ required: true, message: '请输入' }]}
                      style={{ width: '100%', marginBottom: '0' }}
                    >
                      <SelectM
                        showSearch
                        labelInValue
                        // placeholder="请选择"
                        optionlist={historyFlow}
                        onChange={flowNameChange}
                      />
                    </Form.Item>
                  )}
                </Form>
              </div>
              <div className={styles.searchList}>
                <Spin spinning={loadingList}>
                  {dataList.items.map((item: any) => (
                    <div className={styles.listItem} onClick={() => listClick(item)}>
                      <div className={styles.itemInfo}>
                        <span>{item.execId}</span>
                        <span>
                          {item.status === 50 && <Badge status="success" />}
                          {item.status === 30 && <Badge status="processing" />}
                          {item.status !== 50 && item.status !== 30 && <Badge status="error" />}
                          {azStatus[item.status]}
                        </span>
                      </div>
                      <div className={styles.date}>
                        开始时间 &nbsp; {moment(item.startTime).format('YYYY-MM-DD HH:mm:ss')}
                      </div>
                    </div>
                  ))}
                </Spin>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '5px' }}>
                {dataList.total && dataList.total > 10 ? (
                  <Pagination
                    showQuickJumper={false}
                    defaultCurrent={1}
                    showSizeChanger={false}
                    total={dataList.total || 0}
                    onChange={onChangeP}
                    size="small"
                  />
                ) : null}
              </div>
            </section>
            <section className={styles.right}>
              <div className={styles.header}>
                <div className={styles.hContent}>
                  <div className={styles.flowInfo}>
                    {listInfo.logType === 2 ? (
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: runResultData.type !== 'pro' ? '180px' : '280px',
                          display: 'inline-block',
                        }}
                        title={listInfo?.jobLogs[0].name || ''}
                      >
                        作业名：{listInfo?.jobLogs[0].name || ''}
                      </span>
                    ) : (
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          width: runResultData.type !== 'pro' ? '180px' : '280px',
                          display: 'inline-block',
                        }}
                        title={listInfo.flowName || ''}
                      >
                        工作流名：{listInfo.flowName || ''}
                      </span>
                    )}

                    {runResultData.type !== 'pro' && <span>提交人：{listInfo.commitBy || ''}</span>}
                  </div>
                  <div className={styles.flowOp}>
                    <span
                      className={styles.log}
                      onClick={() => {
                        if (!clickItem?.execId) {
                          message.error('请先选择工作流或作业运行结果！');
                          return;
                        }
                        setLogType('workflow');
                        setLogFlag(true);
                      }}
                    >
                      <LogIcon />
                      查看日志
                    </span>
                    <span className={styles.close}>
                      {/* <CloseIcon style={{ cursor: 'pointer' }} onClick={onCancel} /> */}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.rightContent}>
                <div style={{ height: 'calc(100% - 50px)', overflow: 'auto' }}>
                  <Radio.Group defaultValue="a" buttonStyle="solid">
                    <Radio.Button value="a">列表视图</Radio.Button>
                    {/* <Radio.Button value="b">流程视图</Radio.Button> */}
                  </Radio.Group>
                  <MyTable
                    columns={runResultData.type === 'pro' ? columnsPro : columns}
                    className={styles.tableInfo}
                    rowKey="id"
                    request={() => {
                      // 表单搜索项会从 params 传入，传递给后端接口。
                      return Promise.resolve({
                        data: listInfo?.jobLogs || [],
                        success: true,
                      });
                    }}
                    actionRef={actionRef}
                    toolBarRender={false}
                    search={false}
                    pagination={false}
                    titleIcon={true}
                    // bordered
                    top={23}
                    loading={loadingInfo}
                    scroll={{ x: 'max-content' }}
                  />
                  {/* {listInfo?.jobLogs?.nodes?.length ? (
                    <Pagination
                      showQuickJumper={false}
                      defaultCurrent={1}
                      showSizeChanger={false}
                      total={listInfo?.jobLogs?.nodes?.length || 0}
                      // onChange={onChangeInfo}
                      size="small"
                      style={{ marginTop: 10 }}
                    />
                  ) : null} */}
                </div>
              </div>
              {clickItem.startTime && (
                <div className={styles.footTime}>
                  开始时间:&nbsp; {moment(clickItem.startTime).format('YYYY-MM-DD HH:mm:ss')}
                  &nbsp;&nbsp; 结束时间:&nbsp;{' '}
                  {moment(clickItem.endTime).format('YYYY-MM-DD HH:mm:ss')}
                </div>
              )}
            </section>
          </div>
        </Modal>
      )}
      {logFlag && (
        <Logs
          logFlag={logFlag}
          logType={logType}
          clickItem={clickItem}
          cancel={() => setLogFlag(false)}
          currentRecord={currentRecord}
        />
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    setRunData: graphModel.setRunData,
    currentJSONData: graphModel.currentJSONData,
    runResultData: graphModel.runResultData,
    workflowId: fileListModel.workflowId,
    workflowData: fileListModel.workflowData,
  }),
)(RunResultModal);
