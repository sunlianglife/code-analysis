import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { Form, message } from 'antd';
import { useEffect, useState } from 'react';
import service from '../../../api/service';
import DevButton from '@/components/DevButton';
import styles from './index.less';
import { azStatus } from './index';
import moment from 'moment';
// import SelectM from '@/components/Select';

const Logs: React.FC<any> = (props) => {
  const { logFlag, clickItem, currentRecord, logType, cancel } = props;
  const [form] = Form.useForm();
  const [list, setList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [current] = useState(1);

  // 获取作业日志
  const getJobLogs = () => {
    setLoading(true);
    service
      .getJobLogs({
        execId: clickItem.execId,
        jobName: currentRecord.name,
        pageSize: 10,
        current,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setList(res.data.items);
          } else {
            message.error(res.msg);
          }
        }
        setLoading(false);
      });
  };

  // 获取工作流日志
  const getWorkflowLogs = (name?: any) => {
    service
      .getWorkflowLogs({
        flowName: name || clickItem.flowId,
        execId: clickItem.execId,
        pageSize: 10,
        current,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setList(res.data.items);
          } else {
            message.error(res.msg);
          }
        }
      });
  };

  useEffect(() => {
    if (logType === 'job') {
      getJobLogs();
    } else {
      getWorkflowLogs();
      form.setFieldsValue({
        flowName: {
          key: clickItem.flowId,
          value: clickItem.flowId,
          label: clickItem.flowId,
        },
      });
    }
  }, []);

  const onCancel = () => {
    cancel();
  };

  // const flowNameChange = (value: any) => {
  //   getWorkflowLogs(value.value);
  // };

  console.log(list, 22);
  return (
    <div>
      {logFlag && (
        <Modal
          visible={logFlag}
          forceRender
          confirmLoading={loading}
          title={logType === 'job' ? '节点日志' : '工作流日志'}
          okText="确定"
          cancelText="取消"
          width="930px"
          onCancel={onCancel}
          destroyOnClose
          footer={null}
          closable={false}
          centered
        >
          {logType === 'job' ? (
            <div className={styles.topJob}>
              <span>节点名称：</span>
              <span>{currentRecord?.name}</span>
              <span style={{ marginLeft: '56px' }}>开始时间：</span>
              <span>{currentRecord?.timeRange ? currentRecord?.timeRange.split('~')[0] : ''}</span>
              <span style={{ marginLeft: '56px' }}>实例ID：</span>
              <span>{clickItem?.execId}</span>
              <span style={{ marginLeft: '56px' }}>状态：</span>
              <span>{list?.length ? azStatus[list[list.length - 1].status] : ''}</span>
            </div>
          ) : (
            <div className={styles.topJob}>
              <span>工作流名称：{clickItem.flowId || ''}</span>
              {/* <span>
                <Form form={form} style={{ width: '200px', display: 'inline-block' }}>
                  <Form.Item
                    name="flowName"
                    // rules={[{ required: true, message: '请输入' }]}
                    style={{ width: '200px', marginBottom: '0' }}
                  >
                    <SelectM
                      showSearch
                      labelInValue
                      // placeholder="请选择"
                      optionlist={historyFlow}
                      onChange={flowNameChange}
                    />
                  </Form.Item>
                </Form>
              </span> */}
              <span style={{ marginLeft: '56px' }}>开始时间：</span>
              <span>{moment(clickItem.startTime).format('YYYY-MM-DD HH:mm:ss')}</span>
              <span style={{ marginLeft: '56px' }}>实例ID：</span>
              <span>{clickItem.execId}</span>
              <span style={{ marginLeft: '56px' }}>状态：</span>
              <span>{list.length ? azStatus[list[list.length - 1].status] : ''}</span>
            </div>
          )}
          <div className={styles.logContent}>
            {list.length
              ? list?.map((item: any) => (
                  <div
                    dangerouslySetInnerHTML={{ __html: item.data.replace(/\n/g, '<br/>') }}
                  ></div>
                ))
              : null}
          </div>
          <div style={{ position: 'absolute', top: '9px', right: '32px' }}>
            <DevButton onClick={cancel}>取消</DevButton>
            <DevButton type="primary" style={{ marginLeft: '10px' }}>
              刷新日志
            </DevButton>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default connect(({ fileListModel }: { fileListModel: any }) => ({
  workflowId: fileListModel.workflowId,
}))(Logs);
