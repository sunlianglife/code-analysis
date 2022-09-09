// console.log(aa.match(/issue\D*\d{6}/g))
import styles from './mapReduceJobContent.less';
import { useEffect, useState, useImperativeHandle } from 'react';
import { Form, message, Row, Spin, Switch, Radio } from 'antd';
import DevButton from '@/components/DevButton';
import 'ace-builds/src-noconflict/mode-mysql';
import 'ace-builds/src-noconflict/theme-textmate';
import { connect } from 'dva';
import service from './service';
import DInput, { DTextArea } from '@/pages/DataDevelopment/components/DInput';
import SelectM from '@/components/Select';
import { AddIcon } from '@/pages/DataDevelopment/icon';
import { DeleteOutlined } from '@ant-design/icons';
import DevModal from '@/components/DevModal';
import ModalInfo from '../ModalInfo';

const ScriptJobContent: React.FC<any> = (props) => {
  const { cRef, onCancel, workflowId, dispatch, mapReduceJobModelData, currentJSONData, tabKey } =
    props;
  const [form] = Form.useForm();
  const [engineList, setEngineList] = useState<any>([]);
  const [engineInfo, setEngineInfo] = useState<any>({});
  const [preview, setPreview] = useState(false);
  const [readOnly, setReadOnly] = useState(false);
  const [retryFlag, setRetryFlag] = useState(true);
  const [paonesInfo, setPaonesInfo] = useState<any>({
    type: [],
    createName: [],
    testName: [],
    testStatus: [],
    des: [],
  });
  const [visible, setVisible] = useState(false);
  const [infoData, setInfoData] = useState('');

  // 此处注意useImperativeHandle方法的的第一个参数是目标元素的ref引用
  useImperativeHandle(cRef, () => ({
    // changeVal 就是暴露给父组件的方法
    checkParams: () => {
      form.submit();
    },
    commandPreview: () => {
      const values = form.getFieldsValue();
      if (!values.jar) {
        message.error('请先选择主jar路径！');
      } else if (!values.clazz) {
        message.error('请先选择执行类！');
      } else {
        const mapReduceSaveData = {
          isMain: values.isMain,
          args: values.args,
          clazz: values.clazz,
          jar: values?.jar?.value || values.jar,
        };
        service
          .getCommandPreview({
            jobType: 8,
            sqlContent: JSON.stringify(mapReduceSaveData),
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
    },
  }));

  // 获取文件路径
  const getEngine = (key?: any) => {
    service
      .getProjectFile({
        current: 1,
        fileType: 3,
      })
      .then((res: any) => {
        if (res) {
          if (res.success) {
            setEngineList(res?.data?.list.filter((item: any) => item.fileVisible) || []);
            if (key) {
              const item = res.data.list.find((i: any) => key === i.filePath);
              // eslint-disable-next-line @typescript-eslint/no-unused-expressions
              item &&
                form.setFieldsValue({
                  jar: {
                    key: item.filePath,
                    value: item.filePath,
                    label: item.filePath,
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
    if (!mapReduceJobModelData?.data?.id) {
      getEngine('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // 编辑查看默认值
    if (mapReduceJobModelData?.data?.id) {
      service
        .getJobById(
          {
            jobId: mapReduceJobModelData?.data?.id,
          },
          tabKey,
        )
        .then((res: any) => {
          if (res) {
            if (res.success) {
              const sqlContent = res.data?.sqlContent ? JSON.parse(res.data?.sqlContent) : {};
              form.setFieldsValue({
                ...res.data,
                propertiesSet: res.data.propertiesSet ? JSON.parse(res.data.propertiesSet) : [],
                ...sqlContent,
              });
              setRetryFlag(res.data.retry);
              setReadOnly(mapReduceJobModelData?.data?.type === 'preview');
              getEngine(sqlContent.jar);
              // eslint-disable-next-line @typescript-eslint/no-use-before-define
              paonesBlur(res.data.paones, res.data.paones);
            } else {
              message.error(res.msg);
            }
          }
        });
    }
  }, [mapReduceJobModelData]);

  // 保存
  const onFinish = (values: any) => {
    const saveData = {
      ...values,
      flowId: workflowId,
      // engine: values.engine.value,
      propertiesSet: JSON.stringify(values.propertiesSet),
      retryInterval: Number(values.retryInterval),
      retryTimes: Number(values.retryTimes),
      jobType: 8,
    };
    const mapReduceSaveData = {
      isMain: values.isMain,
      args: values.args,
      clazz: values.clazz,
      jar: values.jar?.value || values.jar,
    };
    saveData.sqlContent = JSON.stringify(mapReduceSaveData);
    delete saveData.jar;
    delete saveData.isMain;
    delete saveData.clazz;
    delete saveData.args;
    dispatch({
      type: mapReduceJobModelData?.data?.id ? 'sqlJobModel/editJob' : 'sqlJobModel/saveJob',
      payload: saveData,
      callback: (res: any) => {
        if (res) {
          if (res.success) {
            if (mapReduceJobModelData?.data?.id) {
              // 切换之前销毁画布中的元素
              dispatch({
                type: 'fileListModel/setFlowData',
                payload: [],
              });
              message.success('操作成功');
              // 同步更新操作区的作业名称
              const data = currentJSONData.map((item: any) => {
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
                    // eslint-disable-next-line
                    label: item.id == values.id ? values.name : item.data.label,
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
              });
              dispatch({
                type: 'fileListModel/setFlowData',
                payload: [...data],
              });
            }
            // 重新查询所选工作流下面的job
            dispatch({
              type: 'fileListModel/getJobList',
              payload: {
                flowId: workflowId,
              },
            });
            onCancel();
          } else {
            message.error(res.msg);
          }
        }
      },
    });
  };

  // 执行引擎预览
  const onPreview = () => {
    const info = form.getFieldValue('jar');
    if (!info) {
      message.error('请先选择主jar路径!');
      return;
    }
    service.getProjectFileInfo({ filePath: info?.value || info, fileType: 3 }).then((res: any) => {
      if (res?.data) {
        setEngineInfo(res.data);
        setPreview(true);
      } else {
        message.error('执行类已被删除！');
      }
    });
  };

  const retryChange = (value: any) => {
    setRetryFlag(value);
  };

  const paonesBlur = (value: any, valueString?: any) => {
    // 246771,246772
    if (valueString || value?.target?.value) {
      service
        .getInfoByPaonesId({
          issueIds: valueString || value.target.value,
        })
        .then((res: any) => {
          if (res) {
            if (res.success) {
              const type: any = [];
              const createName: any = [];
              const testName: any = [];
              const testStatus: any = [];
              const des: any = [];
              if (res.data?.length) {
                res.data.forEach((item: any) => {
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.type_name && type.push(`${item.type_name}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.creator_name && createName.push(`${item.creator_name}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.part_qa && testName.push(`${item.part_qa}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.qa_status && testStatus.push(`${item.qa_status}(${item.issue_id})`);
                  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
                  item.issue_desc && des.push(`${item.issue_desc}(${item.issue_id})`);
                });
              }
              setPaonesInfo({
                type,
                createName,
                testName,
                testStatus,
                des,
              });
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
    <div className={styles.scriptJobContent}>
      <section>
        <Spin spinning={false}>
          <Form
            form={form}
            onFinish={onFinish}
            className={styles.devForm}
            preserve={false}
            initialValues={{
              retry: true,
              isMain: '1',
            }}
          >
            <div className={styles.addFiled}>
              <section>
                <Form.Item name="id" label="id" style={{ width: '80%', display: 'none' }}>
                  <DInput disabled={readOnly} />
                </Form.Item>
                <Form.Item
                  name="name"
                  label="作业名"
                  rules={[
                    {
                      required: true,
                      pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/,
                      message: "必须以英文字母开头，支持数字、英文字母、'_'和'.'",
                    },
                  ]}
                  style={{ width: '80%' }}
                >
                  <DInput
                    placeholder="支持英文字母开头，支持数字、英文字母、'_'和'.'"
                    disabled={readOnly}
                  />
                </Form.Item>
                {/* <Form.Item
                  name="isMain"
                  // rules={[{ required: true, message: '请选择' }]}
                  label="main方法执行"
                  style={{ width: '80%' }}
                  valuePropName="checked"
                >
                  <Checkbox >是</Checkbox>
                </Form.Item> */}
                <Form.Item
                  name="isMain"
                  // rules={[{ required: true, message: '请选择' }]}
                  label="main方法执行"
                  style={{ width: '80%' }}
                >
                  <Radio.Group disabled={readOnly}>
                    <Radio value="1">是</Radio>
                  </Radio.Group>
                </Form.Item>
                <div style={{ display: 'flex' }}>
                  <Form.Item
                    name="jar"
                    label="主jar路径"
                    style={{ width: 'calc(80% - 80px)' }}
                    rules={[{ required: true, message: '请选择' }]}
                  >
                    <SelectM
                      showSearch
                      labelInValue
                      placeholder="请选择"
                      optionlist={engineList}
                      disabled={readOnly}
                      labelkey="filePath"
                      label="filePath"
                      // style={{ width: '250px' }}
                    />
                  </Form.Item>
                  <DevButton type="primary" onClick={onPreview}>
                    说明
                  </DevButton>
                </div>
                <Form.Item
                  name="clazz"
                  label="执行类"
                  style={{ width: '80%' }}
                  rules={[{ required: true, message: '请输入' }]}
                >
                  <DInput placeholder={readOnly ? '' : '请输入'} disabled={readOnly} />
                </Form.Item>
                <Form.Item
                  name="args"
                  label="main args"
                  style={{ width: '80%' }}
                  // rules={[{ required: true, message: '请输入' }]}
                >
                  <DInput
                    placeholder={readOnly ? '' : '填入main方法的执行参数，以空格分割'}
                    disabled={readOnly}
                  />
                </Form.Item>
                <Form.Item label="添加脚本参数" style={{ width: '80%' }}>
                  <section
                    className={styles.formItemControlWrap}
                    style={{ width: 'calc(100% + 35px)' }}
                  >
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
                                <DInput disabled={readOnly} placeholder={readOnly ? '' : '参数'} />
                              </Form.Item>
                              <Form.Item
                                {...field}
                                name={[field.name, 'value']}
                                fieldKey={[field.fieldKey, 'name']}
                                style={{ width: '90%' }}
                                rules={[{ required: true, message: '请输入' }]}
                              >
                                <DInput disabled={readOnly} placeholder={readOnly ? '' : '值'} />
                              </Form.Item>
                              <DeleteOutlined
                                style={{
                                  color: '#9e9a9a',
                                  fontSize: '16px',
                                  padding: '10px 0 0 10px',
                                }}
                                onClick={() => !readOnly && remove(field.name)}
                              />
                            </div>
                          ))}
                          <Form.Item className={styles.rowOpts} style={{ width: '100%' }}>
                            <DevButton
                              style={{ width: '100%' }}
                              className={styles.btnAddItem}
                              onClick={() => !readOnly && add()}
                              icon={<AddIcon />}
                            >
                              <span className={styles.txtWarning}>添加</span>
                            </DevButton>
                          </Form.Item>
                        </div>
                      )}
                    </Form.List>
                  </section>
                </Form.Item>
                <Form.Item
                  name="retry"
                  label="自动重跑"
                  style={{ width: '80%', marginTop: '-24px' }}
                  valuePropName="checked"
                >
                  <Switch disabled={readOnly} onChange={retryChange} />
                </Form.Item>
                {retryFlag && (
                  <Form.Item
                    name="retryTimes"
                    label="重跑次数"
                    style={{ width: '80%' }}
                    rules={[
                      {
                        required: retryFlag,
                        pattern: /^[0-9]*[1-9][0-9]*$/,
                        message: '支持输入数字',
                      },
                    ]}
                  >
                    <DInput placeholder="请输入" disabled={readOnly} />
                  </Form.Item>
                )}
                {retryFlag && (
                  <Form.Item
                    name="retryInterval"
                    label="重跑间隔"
                    style={{ width: '80%' }}
                    rules={[
                      {
                        required: retryFlag,
                        pattern: /^[0-9]*[1-9][0-9]*$/,
                        message: '支持输入数字',
                      },
                    ]}
                  >
                    <DInput placeholder="单位秒" disabled={readOnly} />
                  </Form.Item>
                )}
              </section>
              <section>
                <Form.Item
                  name="paones"
                  label="请输入需求ID"
                  style={{ width: '80%' }}
                  // rules={[{ required: true, message: '请输入' }]}
                >
                  <DInput
                    placeholder={readOnly ? '' : '如有多个请用英文逗号隔开'}
                    disabled={readOnly}
                    onBlur={paonesBlur}
                  />
                </Form.Item>
                <Form.Item
                  name="comment"
                  label="备注"
                  style={{ width: '80%' }}
                  // rules={[{ required: true, message: '请输入' }]}
                >
                  <DTextArea
                    placeholder={readOnly ? '' : '请输入'}
                    disabled={readOnly}
                    rows={3}
                    maxLength={255}
                    showCount
                  />
                </Form.Item>
                <div className={styles.paonesInfo}>
                  <Row style={{ padding: '10px 0' }}>
                    {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                    问题类型 ：{/* </Col> */}
                    {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                    {paonesInfo?.type.join(',')}
                    {/* </Col> */}
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                    创建人 ：{/* </Col> */}
                    {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                    {paonesInfo?.createName.join(',')}
                    {/* </Col> */}
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                    测试人员 ：{/* </Col> */}
                    {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                    {paonesInfo?.testName.join(',')}
                    {/* </Col> */}
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                    测试状态 ：{/* </Col> */}
                    {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                    {paonesInfo?.testStatus.join(',')}
                    {/* </Col> */}
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    {/* <Col span={5} style={{ fontSize: '13px', color: '#3C4443' }}> */}
                    需求描述 ：{/* </Col> */}
                    {/* <Col span={19} style={{ fontSize: '13px', color: '#7B7B7B' }}> */}
                    <span dangerouslySetInnerHTML={{ __html: paonesInfo?.des.join(',') }}></span>
                    {/* </Col> */}
                  </Row>
                </div>
              </section>
            </div>
          </Form>
        </Spin>
      </section>
      <DevModal
        visible={preview}
        forceRender
        title="文件路径"
        width={700}
        onCancel={() => setPreview(false)}
        footer={null}
      >
        <Form.Item label="" style={{ width: '80%' }}>
          <span>
            文件路径：
            {engineInfo?.filePath}
          </span>
        </Form.Item>
        <Form.Item label="" style={{ width: '80%' }}>
          <span>描述：{engineInfo.fileComment}</span>
        </Form.Item>
        {/* <Form.Item label="" style={{ width: '80%' }}>
          内容：
          <span
            dangerouslySetInnerHTML={{ __html: engineDetail?.replaceAll(/\n/g, '<br/>') }}
          ></span>
        </Form.Item> */}
      </DevModal>
      {visible && (
        <ModalInfo title="命令预览" visible={visible} infoData={infoData} cancel={cancel} />
      )}
    </div>
  );
};

export default connect(
  ({
    sqlJobModel,
    fileListModel,
    graphModel,
    loading,
  }: {
    sqlJobModel: any;
    fileListModel: any;
    graphModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    workflowId: fileListModel.workflowId,
    projectId: fileListModel.projectId,
    tabKey: fileListModel.tabKey,
    mapReduceJobModelData: sqlJobModel.mapReduceJobModelData,
    dataLoading: loading.effects['sqlJobModel/fetch'],
    currentJSONData: graphModel.currentJSONData,
  }),
)(ScriptJobContent);
