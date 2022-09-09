import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { Form, message } from 'antd';
import SelectM from '@/components/Select';
import { useEffect, useState } from 'react';
import service from '../../service';

const SetRunModal: React.FC<any> = (props) => {
  const { setRunData, dispatch, currentJSONData, fileListModel } = props;
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    service.getFailureAction().then((res: any) => {
      if (res) {
        if (res.success) {
          setList(res.data);
        } else {
          message.error(res.msg);
        }
      }
    });
  }, []);

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setSetRunData',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  const onFinish = (values: any) => {
    // 此时所在的项目
    const projectItem = fileListModel.projectList.find(
      (item: any) => item.key === fileListModel.projectId,
    );
    // 与操作区参数相关的保存-设置并运行
    const params = {
      projectName: projectItem.title,
      flowId: fileListModel.workflowId,
      jobSet: JSON.stringify(
        currentJSONData.map((item: any) => {
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
      failSet: values.failSet.key,
    };
    setLoading(true);
    service.setAndRun(params).then((res: any) => {
      if (res) {
        if (res.success) {
          message.success('操作成功');
          onCancel();
        } else {
          message.error(res.msg);
        }
      }
      setLoading(false);
    });
  };

  return (
    <div>
      {setRunData.visible && (
        <Modal
          visible={setRunData.visible}
          forceRender
          confirmLoading={loading}
          title="设置并运行"
          okText="确定"
          cancelText="取消"
          width="550px"
          onCancel={onCancel}
          onOk={() => form.submit()}
          destroyOnClose
          // footer={null}
          closable={false}
          centered
        >
          <Form
            form={form}
            onFinish={onFinish}
            preserve={false}
            initialValues={{
              failSet: {
                key: 'finishCurrent',
                value: 'finishCurrent',
                label: '继续完成其他分支作业',
              },
            }}
          >
            <Form.Item
              name="failSet"
              label="失败设置"
              style={{ width: '100%' }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <SelectM
                showSearch
                labelInValue
                placeholder="请选择"
                optionlist={list}
                labelkey="value"
                label="title"
              />
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    setRunData: graphModel.setRunData,
    currentJSONData: graphModel.currentJSONData,
    fileListModel,
  }),
)(SetRunModal);
