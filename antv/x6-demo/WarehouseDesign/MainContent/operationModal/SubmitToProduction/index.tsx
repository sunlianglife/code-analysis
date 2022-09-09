import { connect } from 'dva';
import NewModal from '@/components/DevModal';
import { Form, message, Input, Modal } from 'antd';
import { useEffect, useRef, useState } from 'react';
import MyTable from '@/components/CommonTable';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
// import Pagination from '@/pages/DataDevelopment/components/Pagination';
import service from '../../service';
import styles from './index.less';
import moment from 'moment';
import SubmitCode from '@/pages/DataDevelopment/components/SubmitCode';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const SetRunModal: React.FC<any> = (props) => {
  const { submitToProductionData, dispatch, currentJSONData, fileListModel } = props;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const actionRef1 = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const actionRef2 = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const [visible, setVisible] = useState(false);
  const [tableData, setTableData] = useState<any>({});
  const [applicationStatus, setApplicationStatus] = useState<any>([]);
  // 代码展示
  const [codeFlag, setCodeFlag] = useState<any>(false);
  const [codeType, setCodeType] = useState('code');
  const [recordData, setRecordData] = useState<any>({});

  const columnsJob: ProColumns<any>[] = [
    {
      title: '作业',
      dataIndex: 'jobName',
      key: 'jobName',
    },
    {
      title: '测试人',
      dataIndex: 'part_qa',
      key: 'part_qa',
    },
    {
      title: '测试状态',
      dataIndex: 'qa_status',
      key: 'qa_status',
    },
    {
      title: '需求描述',
      dataIndex: 'issue_desc',
      key: 'issue_desc',
    },
  ];

  const columnsTable: ProColumns<any>[] = [
    {
      title: '测试库',
      dataIndex: 'testDb',
      key: 'testDb',
    },
    {
      title: '测试表',
      dataIndex: 'testTbl',
      key: 'testTbl',
    },
    {
      title: '生产库',
      dataIndex: 'proDb',
      key: 'proDb',
    },
    {
      title: '生产表',
      dataIndex: 'proTbl',
      key: 'proTbl',
    },
  ];

  const columnsCodeStatus: ProColumns<any>[] = [
    {
      title: '作业',
      dataIndex: 'jobName',
      key: 'jobName',
    },
    {
      title: '测试代码',
      dataIndex: 'testSqlName',
      key: 'testSqlName',
      render: (value: any, record: any) => (
        <a
          onClick={() => {
            setCodeType('test');
            setRecordData(record);
            setCodeFlag(true);
          }}
        >
          {value}
        </a>
      ),
    },
    {
      title: '待提交代码',
      dataIndex: 'proSqlName',
      key: 'proSqlName',
      render: (value: any, record: any) => (
        <a
          onClick={() => {
            setCodeType('code');
            setRecordData(record);
            setCodeFlag(true);
          }}
        >
          {value}
        </a>
      ),
    },
    {
      title: '提交状态',
      dataIndex: 'status',
      key: 'status',
      render: (value: any) => {
        // eslint-disable-next-line
        const data = applicationStatus?.find((item: any) => item?.value == value);
        return <span>{data?.label}</span>;
      },
    },
    {
      title: '提交人',
      dataIndex: 'insertby',
      key: 'insertby',
    },
    {
      title: '提交时间',
      dataIndex: 'inserttime',
      key: 'inserttime',
      render: (value: any, record: any) => (
        <span>
          {record?.inserttime ? moment(record?.inserttime).format('YYYY-MM-DD HH:mm:ss') : '-'}
        </span>
      ),
    },
    {
      title: '最近提交成功代码',
      dataIndex: 'lastSuccessSqlName',
      key: 'lastSuccessSqlName',
      render: (value: any, record: any) =>
        record.lastSuccessSqlName ? (
          <a
            onClick={() => {
              setCodeType('lately');
              setRecordData(record);
              setCodeFlag(true);
            }}
          >
            {value}
          </a>
        ) : (
          '-'
        ),
    },
  ];

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setSubmitToProductionData',
      payload: {
        visible: false,
        data: {},
      },
    });
    setVisible(false);
  };

  const submitPro = (values: any) => {
    setLoading(true);
    service
      .submitPro({
        ...values,
        flowId: fileListModel.workflowId,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            message.success('操作成功');
            dispatch({
              type: 'graphModel/getFlowStatus',
              payload: { flowId: fileListModel.workflowId },
            });
            onCancel();
          } else {
            message.error(res.msg);
          }
        }
        setLoading(false);
      });
  }

  const onFinish = (values: any) => {
    service.checkProjectVersion({
      projectId: fileListModel.projectId
    }).then((res: any)=>{
      if(res?.success){
        if(res.data){
          submitPro(values)
        }else{
          Modal.confirm({
            title: '提交至生产',
            icon: <ExclamationCircleOutlined />,
            content: <div style={{color: 'red'}}>经检测，对应生产项目已从平台之外被更改了，请谨慎提交！</div>,
            okText: '取消',
            cancelText: '仍然提交',
            onOk() {
            },
            onCancel() {
              submitPro(values)
            },
          });
        }
      }
    })

  };

  // 取出所有依赖关系的目标和起始节点id
  const getEdges = () => {
    const list: string[] = [];
    currentJSONData.forEach((item: any) => {
      if (item.shape === 'dag-edge') {
        list.push(item.source.cell);
        list.push(item.target.cell);
      }
    });
    return list;
  };

  useEffect(() => {
    if (submitToProductionData.visible && currentJSONData.length) {
      const allEdgeCell = getEdges();
      if (
        currentJSONData.find((item: any) => {
          return (
            item.shape === 'dag-node' &&
            !allEdgeCell.includes(item.id) &&
            currentJSONData.length > 1
          );
        })
      ) {
        message.error('存在作业没有任何依赖关系，请修改后重试！');
        onCancel();
      } else {
        setVisible(true);
      }
    } else {
      onCancel();
    }
  }, [submitToProductionData.visible]);

  // 获取申请状态
  useEffect(() => {
    service.getApplicationStatus().then((res: any) => {
      if (res) {
        if (res.success) {
          setApplicationStatus(res.data);
        } else {
          message.error(res.msg);
        }
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    service.getSubmitData({ id: fileListModel.workflowId }).then((res: any) => {
      if (res) {
        if (res.success) {
          setTableData(res.data);
          actionRef?.current?.reload();
          actionRef1?.current?.reload();
          actionRef2?.current?.reload();
        } else {
          message.error(res.msg);
        }
      }
      setLoading(false);
    });
  }, []);

  const cancel = () => {
    setCodeFlag(false);
  };

  return (
    <div>
      {visible && (
        <NewModal
          visible={visible}
          forceRender
          confirmLoading={loading}
          title="提交至生产"
          okText="确定"
          cancelText="取消"
          width="892px"
          onCancel={onCancel}
          onOk={() => form.submit()}
          destroyOnClose
          centered
          className={styles.submitToProductionModal}
        >
          <span className={styles.title}>请检查作业代码提交状态，并确保工作流依赖结构正确！</span>
          <div className={styles.tableInfo}>
            <span className={styles['t-title']}>
              工作流提交至生产模式后，将需对以下作业进行测试：
            </span>
            <MyTable
              columns={columnsJob}
              // className={styles.tableInfo}
              rowKey="id"
              request={() => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return Promise.resolve({
                  data: tableData?.jobInfos || [],
                  success: true,
                });
              }}
              actionRef={actionRef}
              toolBarRender={false}
              search={false}
              pagination={false}
              titleIcon={true}
              // bordered
              top={10}
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
            {/* <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger={true}
              total={100}
              // onChange={onChangeInfo}
              // size="small"
              style={{ marginTop: 30 }}
            /> */}
          </div>
          <div className={styles.tableInfo} style={{ marginTop: '54px' }}>
            <span className={styles['t-title']}>
              工作流提交至生产模式后，将会在生产库中创建测试库中对应表：
            </span>
            <MyTable
              columns={columnsTable}
              // className={styles.tableInfo}
              rowKey="id"
              request={() => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return Promise.resolve({
                  data: tableData?.proTableInfos || [],
                  success: true,
                });
              }}
              actionRef={actionRef1}
              toolBarRender={false}
              search={false}
              pagination={false}
              titleIcon={true}
              // bordered
              top={10}
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
            {/* <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger={true}
              total={100}
              // onChange={onChangeInfo}
              // size="small"
              style={{ marginTop: 30 }}
            /> */}
          </div>
          <div className={styles.tableInfo} style={{ marginTop: '54px' }}>
            <span className={styles['t-title']}>以下为最新作业代码提交状态：</span>
            <MyTable
              columns={columnsCodeStatus}
              // className={styles.tableInfo}
              rowKey="id"
              request={() => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return Promise.resolve({
                  data: tableData?.sqlSubmitInfos || [],
                  success: true,
                });
              }}
              actionRef={actionRef2}
              toolBarRender={false}
              search={false}
              pagination={false}
              titleIcon={true}
              // bordered
              top={10}
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
            {/* <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger={true}
              total={100}
              // onChange={onChangeInfo}
              // size="small"
              style={{ marginTop: 30 }}
            /> */}
          </div>
          <Form form={form} onFinish={onFinish} preserve={false}>
            <Form.Item
              name="comment"
              label="提交说明"
              style={{ width: '100%', marginTop: '54px' }}
              rules={[{ required: true, message: '请输入' }]}
            >
              <Input.TextArea
                showCount
                maxLength={200}
                style={{ height: 146 }}
                rows={4}
                placeholder="请输入工作流描述，不超过200个字符"
              />
            </Form.Item>
          </Form>
        </NewModal>
      )}
      {codeFlag && (
        <SubmitCode
          cancel={cancel}
          codeFlag={codeFlag}
          codeType={codeType}
          id={recordData?.jobId}
        />
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    submitToProductionData: graphModel.submitToProductionData,
    currentJSONData: graphModel.currentJSONData,
    fileListModel,
  }),
)(SetRunModal);
