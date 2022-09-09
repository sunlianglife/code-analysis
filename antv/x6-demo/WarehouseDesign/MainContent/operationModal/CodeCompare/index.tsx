import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { useEffect, useRef, useState } from 'react';
import MyTable from '@/components/CommonTable';
// import Pagination from '@/pages/DataDevelopment/components/Pagination';
import type { ActionType, ProColumns } from '@ant-design/pro-table';
import copy from 'copy-to-clipboard';
import { Form, message } from 'antd';
import service from '../../service';
import CodeDiff from 'react-code-diff-lite';
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-textmate';
import moment from 'moment';

const statusText = {
  '0': '当前版本，未提交',
  '1': '当前版本，提交申请中',
  '2': '当前版本，已提交',
  '3': '当前版本，未提交',
};

const CodeCompare: React.FC<any> = (props) => {
  const { dispatch, compareData } = props;
  const actionRef = useRef<ActionType>(); // antd-pro-Table手动触发刷新需要自定义ref
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState<any>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [detailFlag, setDetailFlag] = useState(false);
  const [compareFlag, setCompareFlag] = useState(false);
  const [versionStatus, setStatus] = useState(0);
  const [recordInfo, setRecordInfo] = useState<any>({});

  const columns: ProColumns<any>[] = [
    {
      title: '版本',
      dataIndex: 'jobVersion',
      key: 'jobVersion',
      render: (text: any, record: any, index: number) => {
        if (index === 1) {
          return (
            <>
              <span>{`V${text}`}</span>
              <span
                style={{
                  marginLeft: '20px',
                  background: '#5dd9c2',
                  color: 'white',
                  padding: '2px 4px',
                }}
              >
                {statusText[versionStatus]}
              </span>
            </>
          );
        }
        if (index === 0) {
          if (record.jobSqlContent.indexOf('暂无') > -1) {
            return '暂无生产代码';
          }
          return '生产代码';
        }
        return `V${text}`;
      },
    },
    {
      title: '更新人',
      dataIndex: 'updateby',
      key: 'updateby',
    },
    {
      title: '更新时间',
      dataIndex: 'updatetime',
      key: 'updatetime',
      render: (text: any, record: any) =>
        record?.updatetime ? moment(text).format('YYYY-MM-DD HH:mm:ss') : '-',
    },
    {
      title: '操作',
      render: (text: any, record: any) => (
        <a
          onClick={() => {
            setRecordInfo(record);
            setDetailFlag(true);
          }}
        >
          详情
        </a>
      ),
    },
  ];

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setCompareData',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  useEffect(() => {
    if (compareData?.data?.id) {
      setLoading(true);
      service
        .getCodeVersion({
          jobId: compareData.data.id,
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              setStatus(res.data.status);
              setList(
                res.data.versionList.map((item: any) => ({
                  ...item,
                  id: item.id ?? 99999,
                })),
              );
              setSelectedRowKeys([99999]);
              actionRef?.current?.reload();
            } else {
              message.error(res.mag);
            }
            setLoading(false);
          }
        });
    }
  }, [compareData]);

  const compareCode = () => {
    if (selectedRowKeys.length !== 2) {
      message.error('请选择两个版本进行代码比对!');
      return;
    }
    setCompareFlag(true);
    form.setFieldsValue({
      sqlContentLeft:
        selectedRows[0].jobSqlContent?.indexOf('暂无') > -1 ? '' : selectedRows[0].jobSqlContent,
      sqlContentRight: selectedRows[1].jobSqlContent,
    });
  };

  return (
    <div>
      {compareData.visible && (
        <Modal
          visible={compareData.visible}
          title={`代码版本 - ${compareData.data.title}`}
          okText="对比"
          cancelText="取消"
          width="800px"
          onCancel={onCancel}
          centered
          // closeIcon={<DrawerIcon />}
          onOk={compareCode}
        >
          <>
            <h4>请选择两个版本进行代码比对</h4>
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
              rowSelection={{
                selectedRowKeys,
                onChange: (selectedKeys: React.Key[], selectedRow: any) => {
                  if (selectedKeys?.length > 2) {
                    message.error('仅支持之多两个版本进项比对！');
                    return;
                  }
                  setSelectedRowKeys(selectedKeys);
                  setSelectedRows(selectedRow);
                },
              }}
            />
            {/* {list.total ? ( */}
            {/* <Pagination
              showQuickJumper={false}
              defaultCurrent={1}
              showSizeChanger
              total={list.length}
              // onChange={onChangeP}
              showTotal
              style={{ marginTop: 30 }}
            /> */}
            {/* ) : null} */}
          </>
        </Modal>
      )}
      {detailFlag && (
        <Modal
          visible={detailFlag}
          title={`${compareData.data.title}代码详情 - ${
            recordInfo.id === 99999 ? '生产代码' : `V${recordInfo.jobVersion}`
          }`}
          okText="复制  "
          cancelText="取消"
          width="700px"
          onCancel={() => setDetailFlag(false)}
          onOk={() => {
            if (copy(recordInfo.jobSqlContent)) {
              message.success('复制成功!');
            }
          }}
          centered
        >
          <div
            style={{ marginBottom: '20px' }}
            dangerouslySetInnerHTML={{
              __html: recordInfo?.jobSqlContent?.replaceAll(/\n/g, '<br/>') || '',
            }}
          ></div>
        </Modal>
      )}
      {compareFlag && (
        <Modal
          visible={compareFlag}
          title={`${compareData.data.title}代码详情 - 生产代码`}
          cancelText="取消"
          width="1200px"
          onCancel={() => setCompareFlag(false)}
          centered
          // footer={<DevButton onClick={()=>setDetailFlag(false)}>取消</DevButton>}
          footer={null}
        >
          <Form
            form={form}
            preserve={false}
            initialValues={{
              retry: true,
            }}
            style={{ width: '100%', display: 'flex' }}
          >
            <div style={{ width: '100%' }}>
              <strong>
                版本：
                {selectedRows[0].id === 99999
                  ? '生产代码'
                  : `开发代码(V${selectedRows[0].jobVersion})`}
              </strong>
              <strong style={{ marginLeft: '43%' }}>
                版本：
                {selectedRows[1].id === 99999
                  ? '生产代码'
                  : `开发代码(V${selectedRows[1].jobVersion})`}
              </strong>
              <CodeDiff
                oldStr={
                  selectedRows[0]?.jobSqlContent?.indexOf('暂无') > -1
                    ? ''
                    : selectedRows[0]?.jobSqlContent
                }
                newStr={selectedRows[1]?.jobSqlContent}
                context={1000}
                outputFormat="side-by-side"
              />
            </div>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ graphModel }: { graphModel: any }) => ({
  compareData: graphModel.compareData,
}))(CodeCompare);
