import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { Form, message } from 'antd';
import SelectM from '@/components/Select';
import { useEffect, useState } from 'react';
import DInput, { DTextArea } from '@/pages/DataDevelopment/components/DInput';
import styles from './styles.less';
import DevButton from '@/components/DevButton';
import ModalInfo from '../ModalInfo';
import { DeleteOutlined } from '@ant-design/icons';
import { AddIcon } from '@/pages/DataDevelopment/icon';
import { NewGraph } from '../../MainContent/AntvDagContent/graph';
import service from '@/pages/DataDevelopment/pages/ProjectCenter/service';
import serviceTab from '@/pages/DataDevelopment/pages/WarehouseDesign/api/service';
import serviceSqlJOb from '../SqlJobAdd/service';

const textStatus = {
  add: '创建检查作业',
  edit: '编辑检查作业',
  preview: '检查作业详情',
};

const TableJobModal: React.FC<any> = (props) => {
  const { dispatch, addTableJob, fileListModel } = props;
  const [form] = Form.useForm();
  const [engineList, setEngineList] = useState<any>([]);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [infoData, setInfoData] = useState('');
  const [editData, setEditData] = useState<any>({}); // 查看或者编辑的值

  // 获取执行引擎
  const getEngine = (key?: any) => {
    service.getEngine({ engineType: 2, current: 1 }).then((res: any) => {
      if (res) {
        if (res.success) {
          const data = res?.data?.list.filter((item: any) => item.engineVisible) || [];
          setEngineList(data);
          if (key) {
            const item = res.data.list.find((i: any) => key === i.enginePath);
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions
            item &&
              form.setFieldsValue({
                engine: {
                  key: item.enginePath,
                  value: item.enginePath,
                  label: item.enginePath,
                },
              });
          } else {
            form.setFieldsValue({
              engine: {
                key: data?.[0].enginePath,
                value: data?.[0].enginePath,
                label: data?.[0].enginePath,
              },
            });
          }
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  useEffect(() => {
    if (addTableJob.data.modalId) {
      setLoading(true);
      serviceSqlJOb
        .getJobById(
          {
            jobId: addTableJob.data.modalId,
          },
          fileListModel.tabKey,
        )
        .then((res: any) => {
          if (res) {
            if (res.success) {
              setEditData(res.data);
              form.setFieldsValue({
                name: res.data.name,
                propertiesSet: res.data.propertiesSet ? JSON.parse(res.data.propertiesSet) : [],
              });
              getEngine(res.data.engine);
            } else {
              message.error(res.msg);
            }
          }
          setLoading(false);
        });
    } else {
      getEngine();
      form.setFieldsValue({
        name: `${addTableJob?.data?.title?.split('.sql')[0]}_check_${fileListModel.workflowId}`,
      });
    }
  }, [addTableJob]);

  const onCancel = () => {
    dispatch({
      type: 'sqlJobModel/setAddTableJob',
      payload: {
        visible: false,
        data: null,
      },
    });
  };

  const processingData = (data: any) => {
    // 与操作区参数相关的保存-添加到操作区
    const info = {
      id: data.id,
      shape: 'dag-node',
      x: 200,
      y: 200,
      disabled: false,
      closed: true,
      data: {
        label: data.name,
        outRely: fileListModel.workflowId !== data.flowId,
        // tableInfo: item?.children[0] ? item?.children[0] : undefined,
        flowId: data.flowId,
        jobType: data.jobType,
      },
      flowId: data.flowId,
      ports: [
        {
          id: `${data.id}-1`,
          group: 'top',
        },
        {
          id: `${data.id}-2`,
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
    onCancel();
  };

  // 保存
  const onFinish = async (values: any) => {
    let saveData: any;
    if (addTableJob?.data?.modalType === 'add') {
      saveData = {
        jobCodeName: addTableJob?.data?.title,
        name: values.name,
        engine: values.engine?.value || values.engine,
        propertiesSet: JSON.stringify(values.propertiesSet),
        jobType: 2,
        flowId: fileListModel.workflowId,
        externalFlow: addTableJob?.data?.externalFlow,
      };
    } else {
      saveData = {
        name: values.name,
        engine: values.engine?.value || values.engine,
        propertiesSet: JSON.stringify(values.propertiesSet),
        id: addTableJob?.data?.modalId,
        jobType: 2,
      };
    }

    // 保存工作流
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
      setLoading(true);
      serviceTab.saveData(params).then((res: any) => {
        if (res) {
          if (res.success) {
            serviceTab.tabJobAddEdit(saveData).then((resq: any) => {
              if (resq) {
                if (resq.success) {
                  processingData({
                    id: resq.data,
                    ...saveData,
                  });
                } else {
                  message.error(resq.msg);
                }
              }
              setLoading(false);
            });
          } else {
            setLoading(false);
            message.error(res.msg);
          }
        } else {
          setLoading(false);
        }
      });
    }
  };

  // 命令预览
  const commandPreview = () => {
    const values = form.getFieldsValue();
    if (!values.engine) {
      message.error('请先选择引擎路径！');
    } else {
      serviceSqlJOb
        .getCommandPreview({
          jobType: 2,
          engine: values.engine?.value || values.engine,
          jobCodeName:
            addTableJob?.data?.modalType === 'add'
              ? values.name.split('_check')[0]
              : editData.jobCodeName,
          propertiesSet: JSON.stringify(values.propertiesSet),
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              setVisible(true);
              setInfoData(res.data);
            } else {
              message.error(res.msg);
            }
          }
        });
    }
  };

  // 命令预览弹框
  const cancel = () => {
    setVisible(false);
  };

  return (
    <div className={styles.tableJobModal}>
      {addTableJob.visible && (
        <Modal
          visible={addTableJob.visible}
          forceRender
          confirmLoading={loading}
          title={textStatus[addTableJob?.data?.modalType]}
          okText="确定"
          cancelText="取消"
          width="550px"
          onCancel={onCancel}
          onOk={() => form.submit()}
          destroyOnClose
          footer={
            <div>
              <DevButton onClick={commandPreview}>命令预览</DevButton>
              <DevButton onClick={onCancel} style={{ marginLeft: '10px' }}>
                取消
              </DevButton>
              <DevButton
                onClick={() => form.submit()}
                type="primary"
                style={{ marginLeft: '10px' }}
              >
                确认
              </DevButton>
            </div>
          }
          closable={false}
          centered
          okButtonProps={{ disabled: addTableJob?.data?.modalType === 'preview' }}
        >
          <Form
            form={form}
            onFinish={onFinish}
            preserve={false}
            className={styles.tableJobModalForm}
          >
            <Form.Item
              name="name"
              label="作业名"
              style={{ width: '100%' }}
              rules={[
                // { required: true, message: '请输入' },
                {
                  required: true,
                  pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/,
                  message: "必须以英文字母开头，支持数字、英文字母、'_'和'.'",
                },
              ]}
            >
              <DInput
                autocomplete="off"
                placeholder="支持英文字母开头，支持数字、英文字母、'_'和'.'"
                disabled
              />
            </Form.Item>
            <Form.Item
              name="engine"
              label="引擎路径"
              style={{ width: '100%' }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <SelectM
                showSearch
                labelInValue
                placeholder="请选择"
                optionlist={engineList}
                labelkey="enginePath"
                label="enginePath"
                disabled={addTableJob?.data?.modalType === 'preview'}
              />
            </Form.Item>
            <Form.Item name="comment" label="备注">
              <DTextArea
                placeholder={addTableJob?.data?.modalType === 'preview' ? '' : '请输入'}
                rows={3}
                maxLength={255}
                showCount
                disabled={addTableJob?.data?.modalType === 'preview'}
              />
            </Form.Item>
            <Form.Item label="添加脚本参数">
              <Form.List name={['propertiesSet']}>
                {(fields, { add, remove }) => (
                  <div className={styles.rowItem} style={{ width: '100%' }}>
                    {fields.map((field: any) => (
                      <div style={{ display: 'flex' }} key={field.key}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'key']}
                          fieldKey={[field.fieldKey, 'name']}
                          style={{ width: '90%' }}
                        >
                          <DInput
                            disabled={addTableJob?.data?.modalType === 'preview'}
                            placeholder={addTableJob?.data?.modalType === 'preview' ? '' : '参数'}
                          />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'name']}
                          style={{ width: '90%', marginLeft: '10px' }}
                          rules={[{ required: true, message: '请输入' }]}
                        >
                          <DInput
                            disabled={addTableJob?.data?.modalType === 'preview'}
                            placeholder={addTableJob?.data?.modalType === 'preview' ? '' : '值'}
                          />
                        </Form.Item>
                        <DeleteOutlined
                          style={{
                            color: '#9e9a9a',
                            fontSize: '16px',
                            padding: '10px 0 0 10px',
                          }}
                          onClick={() =>
                            addTableJob?.data?.modalType !== 'preview' && remove(field.name)
                          }
                        />
                      </div>
                    ))}
                    <Form.Item className={styles.rowOpts} style={{ width: '100%' }}>
                      <DevButton
                        style={{ width: '100%' }}
                        className={styles.btnAddItem}
                        onClick={() => add()}
                        icon={<AddIcon />}
                        disabled={addTableJob?.data?.modalType === 'preview'}
                      >
                        <span className={styles.txtWarning}>添加</span>
                      </DevButton>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          </Form>
          {visible && (
            <ModalInfo title="命令预览" visible={visible} infoData={infoData} cancel={cancel} />
          )}
        </Modal>
      )}
    </div>
  );
};

export default connect(
  ({ sqlJobModel, fileListModel }: { sqlJobModel: any; fileListModel: any }) => ({
    addTableJob: sqlJobModel.addTableJob,
    fileListModel,
  }),
)(TableJobModal);
