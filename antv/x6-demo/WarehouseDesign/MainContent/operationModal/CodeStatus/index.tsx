import { connect } from 'dva';
import DevDrawer from '@/pages/DataDevelopment/components/DevDrawer';
import { useEffect, useRef, useState } from 'react';
import MyTable from '@/components/CommonTable';
// import Pagination from '@/pages/DataDevelopment/components/Pagination';
import { DrawerIcon } from '@/pages/DataDevelopment/icon';
import service from '../../../api/service';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import { message } from 'antd';
import styles from './index.less';
import SubmitCode from '@/pages/DataDevelopment/components/SubmitCode';
import moment from 'moment';

const CodeStatusDrawer: React.FC<any> = (props) => {
  const { codeStatusList, dispatch, currentJSONData, workflowId } = props;
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [codeFlag, setCodeFlag] = useState<any>(false);
  const [codeType, setCodeType] = useState('code');
  const [recordData, setRecordData] = useState<any>({});

  const columns: ProColumns<any>[] = [
    {
      title: '作业名',
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
        switch (value) {
          case 1:
            return (
              <span className={styles.status}>
                <span className={styles.sign} style={{ background: '#FFDC51' }}></span>未审批
              </span>
            );
          case 2:
            return (
              <span className={styles.status}>
                <span className={styles.sign} style={{ background: '#38CCB5' }}></span>已审批
              </span>
            );
          case 3:
            return (
              <span className={styles.status}>
                <span className={styles.sign} style={{ background: '#EE755B' }}></span>已拒绝
              </span>
            );
          case 4:
            return (
              <span className={styles.status}>
                <span className={styles.sign} style={{ background: '#b7c1bf' }}></span>已取消
              </span>
            );
          default:
            return '-';
        }
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
      render: (value: any) => {
        return <span>{value !== '-' ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>;
      },
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
    {
      title: '最近提交人',
      dataIndex: 'lastInsertby',
      key: 'lastInsertby',
    },
    {
      title: '最近提交时间',
      dataIndex: 'lastInserttime',
      key: 'lastInserttime',
      render: (value: any) => {
        return <span>{value !== '-' ? moment(value).format('YYYY-MM-DD HH:mm:ss') : '-'}</span>;
      },
    },
  ];

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setCodeStatusList',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  useEffect(() => {
    setLoading(true);
    service.getCodeStatusList({ flowId: workflowId }).then((res: any) => {
      if (res) {
        if (res.success) {
          // setList(res.data)
          const data: any = [];
          res.data.forEach((i: any) => {
            currentJSONData?.forEach((y: any) => {
              if (i.jobName === y?.data?.label) {
                data.push(i);
              }
            });
          });
          setList(data);
          if (actionRef.current) {
            actionRef.current.reload();
          }
        } else {
          message.error(res.msg);
        }
      }
      setLoading(false);
    });
  }, [currentJSONData]);

  const cancel = () => {
    setCodeFlag(false);
  };

  return (
    <div>
      {codeStatusList.visible && (
        <DevDrawer
          visible={codeStatusList.visible}
          title="代码状态"
          width={1000}
          onClose={onCancel}
          closeIcon={<DrawerIcon />}
        >
          <>
            <MyTable
              columns={columns}
              rowKey="id"
              request={() => {
                // 表单搜索项会从 params 传入，传递给后端接口。
                return Promise.resolve({
                  // data: list.list || [],
                  data: list,
                  success: true,
                });
              }}
              actionRef={actionRef}
              toolBarRender={false}
              search={false}
              pagination={false}
              titleIcon={true}
              bordered
              top={0}
              loading={loading}
              scroll={{ x: 'max-content' }}
            />
            {/* <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger
              total={list.length}
              // onChange={onChangeP}
              showTotal
              style={{ marginTop: 30 }}
            /> */}
          </>
          {codeFlag && (
            <SubmitCode
              cancel={cancel}
              codeFlag={codeFlag}
              codeType={codeType}
              id={recordData?.jobId}
            />
          )}
        </DevDrawer>
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    codeStatusList: graphModel.codeStatusList,
    currentJSONData: graphModel.currentJSONData,
    jobList: fileListModel.jobList,
    workflowId: fileListModel.workflowId,
  }),
)(CodeStatusDrawer);
