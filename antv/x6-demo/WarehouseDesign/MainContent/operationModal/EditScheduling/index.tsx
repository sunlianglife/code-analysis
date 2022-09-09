import { connect } from 'dva';
import Modal from '@/components/DevModal';
import { Checkbox, Form, message } from 'antd';
import SelectM from '@/components/Select';
import { useEffect, useState } from 'react';
import service from '../../service';
import styles from './index.less';
import DevButton from '@/components/DevButton';
import DInput from '@/pages/DataDevelopment/components/DInput';
import { DeleteOutlined } from '@ant-design/icons';
import { AddIcon } from '@/pages/DataDevelopment/icon';
import CronOption from '@/pages/DataDevelopment/components/CronOption';

const EditScheduling: React.FC<any> = (props) => {
  const { editDispatch, dispatch, fileListModel } = props;
  const [form] = Form.useForm();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cronValue, setCronValue] = useState('');
  const [checkValue, setCheckValue] = useState(false);
  const [userList, setUserList] = useState<any>([]);
  const [userInfo, setUserInfo] = useState<any>({}); // 根据用户名查询信息

  useEffect(() => {
    setLoading(false);
    service.getFailureAction().then((res: any) => {
      if (res) {
        if (res.success) {
          setList(res.data);
          if (editDispatch.data?.type === 'preview') {
            // 查询调度信息
            service.getDispatchInfo({ flowId: fileListModel.workflowId }).then((resp: any) => {
              if (resp) {
                if (resp.success) {
                  form.setFieldsValue({
                    cron: resp.data.cron,
                    failSet: {
                      label: res.data.find((i: any) => i.value === resp.data.failSet).title,
                      key: resp.data.failSet,
                      value: resp.data.failSet,
                    },
                    failWarn: resp.data.failWarn ? JSON.parse(resp.data.failWarn) : [],
                  });
                  setCronValue(resp.data.cron);
                } else {
                  message.error(resp.msg);
                }
              }
            });
          }
        } else {
          message.error(res.msg);
        }
      }
    });

    // 查询用户
    service.getUserList().then((res: any) => {
      if (res) {
        if (res.success) {
          setUserList(res.data.map((item: any) => ({ id: item.username, name: item.username })));
        } else {
          message.error(res.msg);
        }
      }
    });
  }, []);

  const onCancel = () => {
    dispatch({
      type: 'graphModel/setEditDispatch',
      payload: {
        visible: false,
        data: {},
      },
    });
  };

  const onFinish = (values: any) => {
    const params = {
      flowName: fileListModel.workflowData.title,
      flowId: fileListModel.workflowId,
      projectName: fileListModel.projectName,
      // TODO 一期先隐藏
      // propertiesSet: JSON.stringify(values.propertiesSet),
      failSet: values.failSet.key,
      cron: values.cron.split(' ').length < 6 ? `0 ${values.cron}` : values.cron,
      failWarn: values?.failWarn
        ? values.failWarn.map((item: any) => {
            return {
              ...item,
              emailAddress: userInfo[item.username].email || `${item.username}@xinye.com`,
              phoneNumber: userInfo[item.username].mobilePhone,
            };
          })
        : undefined,
    };
    service.schedule(params).then(async (res: any) => {
      if (res) {
        if (res.success) {
          message.success('操作成功！');
          dispatch({
            type: 'graphModel/getFlowStatus',
            payload: { flowId: fileListModel.workflowId },
          });
          // 重新查询fileList
          dispatch({
            type: 'fileListModel/fetchById',
            payload: { id: fileListModel.projectId },
          });
          await dispatch({
            type: 'fileListModel/setFlowData',
            payload: [],
          });
          service.getProJob({ flowId: fileListModel.workflowId }).then((res1: any) => {
            if (res) {
              if (res.success) {
                dispatch({
                  type: 'fileListModel/setFlowData',
                  payload: res1.data ? JSON.parse(res1.data) : [],
                });
              }
            }
          });

          // setTimeout(()=>{
          //   dispatch({
          //     type: 'fileListModel/setFlowData',
          //     payload: JSON.parse(JSON.stringify(fileListModel.flowData)),
          //   });
          // },500)
          onCancel();
        } else {
          message.error(res.msg);
        }
      }
    });
  };

  const customSetValue = (cron: string) => {
    setCronValue(cron);
    form.setFieldsValue({ cron });
  };

  const checkChange = (e: any) => {
    setCheckValue(e.target.checked);
  };

  const onChange = (value: any) => {
    if (value) {
      service.getUserInfo({ username: value }).then((res: any) => {
        if (res) {
          if (res.success) {
            setUserInfo({
              ...userInfo,
              [value]: res.data,
            });
          } else {
            message.error(res.msg);
          }
        }
      });
    }
  };

  return (
    <div>
      {editDispatch.visible && (
        <Modal
          visible={editDispatch.visible}
          forceRender
          confirmLoading={loading}
          title={editDispatch.data?.type === 'preview' ? '调度信息' : '编辑调度'}
          okText="确定"
          cancelText="取消"
          width="650px"
          onCancel={onCancel}
          onOk={() => form.submit()}
          destroyOnClose
          // footer={null}
          closable={false}
          centered
          okButtonProps={{
            disabled: editDispatch.data?.type === 'preview',
          }}
        >
          <Form
            form={form}
            onFinish={onFinish}
            preserve={false}
            className={styles.editDispatch}
            initialValues={{
              failSet: {
                key: 'finishCurrent',
                value: 'finishCurrent',
                label: '继续完成其他分支作业',
              },
            }}
          >
            <Form.Item
              name="cronExpSelect"
              label="频率"
              // rules={[{ required: true, message: '请选择' }]}
              style={checkValue ? { display: 'none' } : {}}
            >
              <CronOption
                cronValue={cronValue}
                setCronValue={customSetValue}
                className={styles.cronWrap}
                disabled={editDispatch.data?.type === 'preview'}
              />
            </Form.Item>
            <Form.Item
              name="cron"
              label="频率"
              rules={[{ required: true, message: '请输入' }]}
              style={checkValue ? {} : { display: 'none' }}
            >
              <DInput prefix="0" disabled={editDispatch.data?.type === 'preview'} />
            </Form.Item>
            <Form.Item label=" ">
              <Checkbox onClick={checkChange}>高级</Checkbox>
            </Form.Item>
            <Form.Item
              name="failSet"
              label="失败设置"
              rules={[{ required: true, message: '请选择' }]}
            >
              <SelectM
                showSearch
                labelInValue
                placeholder="请选择"
                // style={{ height: 34 }}
                optionlist={list}
                labelkey="value"
                label="title"
                disabled={editDispatch.data?.type === 'preview'}
              />
            </Form.Item>
            {/* TODO 一期先隐藏 */}
            {/* <Form.Item label="自定义属性">
              <Form.List name={['propertiesSet']}>
                {(fields, { add, remove }) => (
                  <div className={styles.rowItem} style={{ width: '100%' }}>
                    {fields.map((field) => (
                      <div style={{ display: 'flex' }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'key']}
                          fieldKey={[field.fieldKey, 'name']}
                          style={{ width: '45%' }}
                        >
                          <DInput placeholder="参数" />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'value']}
                          fieldKey={[field.fieldKey, 'name']}
                          style={{ width: '45%', marginLeft: '10px' }}
                        >
                          <DInput placeholder="值" />
                        </Form.Item>
                        <DeleteOutlined
                          style={{
                            color: '#9e9a9a',
                            fontSize: '16px',
                            padding: '10px 0 0 10px',
                          }}
                          onClick={() => remove(field.name)}
                        />
                      </div>
                    ))}
                    <Form.Item className={styles.rowOpts} style={{ width: '100%' }}>
                      <DevButton
                        style={{ width: '100%' }}
                        className={styles.btnAddItem}
                        onClick={() => add()}
                        icon={<AddIcon />}
                      >
                        <span className={styles.txtWarning}>添加</span>
                      </DevButton>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </Form.Item> */}
            <Form.Item label="失败报警">
              <Form.List name={['failWarn']}>
                {(fields, { add, remove }) => (
                  <div className={styles.rowItem} style={{ width: '100%' }}>
                    {fields.map((field) => (
                      <div style={{ display: 'flex' }}>
                        <Form.Item
                          {...field}
                          name={[field.name, 'username']}
                          fieldKey={[field.fieldKey, 'username']}
                          style={{ width: '45%' }}
                          rules={[{ required: true, message: '请添加' }]}
                        >
                          <SelectM
                            showSearch
                            // labelInValue
                            placeholder="请选择"
                            // style={{ height: 34 }}
                            optionlist={userList}
                            onChange={onChange}
                            disabled={editDispatch.data?.type === 'preview'}
                          />
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'mail']}
                          fieldKey={[field.fieldKey, 'mail']}
                          valuePropName="checked"
                          style={{ marginLeft: '20px' }}
                        >
                          <Checkbox disabled={editDispatch.data?.type === 'preview'}>邮箱</Checkbox>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'message']}
                          fieldKey={[field.fieldKey, 'message']}
                          valuePropName="checked"
                          // style={{display: 'inline-block'}}
                        >
                          <Checkbox disabled>短信</Checkbox>
                        </Form.Item>
                        <Form.Item
                          {...field}
                          name={[field.name, 'phone']}
                          fieldKey={[field.fieldKey, 'phone']}
                          valuePropName="checked"
                          // style={{display: 'inline-block'}}
                        >
                          <Checkbox disabled>电话</Checkbox>
                        </Form.Item>
                        <DeleteOutlined
                          style={{
                            color: '#9e9a9a',
                            fontSize: '16px',
                            padding: '8px 0 0 10px',
                          }}
                          onClick={() =>
                            editDispatch.data?.type !== 'preview' && remove(field.name)
                          }
                        />
                      </div>
                    ))}
                    <Form.Item className={styles.rowOpts} style={{ width: '100%' }}>
                      <DevButton
                        style={{ width: '100%' }}
                        className={styles.btnAddItem}
                        onClick={() => add({ mail: true })}
                        icon={<AddIcon />}
                        disabled={editDispatch.data?.type === 'preview'}
                      >
                        <span className={styles.txtWarning}>添加</span>
                      </DevButton>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </div>
  );
};

export default connect(
  ({ graphModel, fileListModel }: { graphModel: any; fileListModel: any }) => ({
    editDispatch: graphModel.editDispatch,
    currentJSONData: graphModel.currentJSONData,
    fileListModel,
  }),
)(EditScheduling);
