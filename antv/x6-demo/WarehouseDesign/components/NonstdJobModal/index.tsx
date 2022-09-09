import SqlModal from '@/components/DevModal';
import ScriptJobModal from './nonstdJobContent';
import { useRef } from 'react';
import DevButton from '@/components/DevButton';
import { connect } from 'dva';
import { Alert } from 'antd';

interface IProps {
  visible: boolean;
  tabKey: string;
  onCancel: () => void;
  dataLoading: boolean;
  nonstdJobModelData: any;
  dataLoadingUpdate: any;
}

const textStatus = {
  add: 'Nonstd作业（新增）',
  edit: 'Nonstd作业（编辑）',
  preview: 'Nonstd作业详情',
};

const SqlJobAdd: React.FC<IProps> = (props) => {
  const { visible, onCancel, dataLoading, nonstdJobModelData, dataLoadingUpdate } = props;
  const childRef = useRef<any>();

  const save = () => {
    if (childRef?.current?.checkParams) {
      childRef?.current?.checkParams();
    }
  };

  // 命令预览
  const commandPreview = () => {
    if (childRef?.current?.commandPreview) {
      childRef?.current?.commandPreview();
    }
  };

  return (
    <div>
      {visible && (
        <SqlModal
          visible={visible}
          forceRender
          // confirmLoading={dataLoading}
          title={textStatus[nonstdJobModelData?.data?.type]}
          okText="确定"
          cancelText="取消"
          width="80%"
          onCancel={onCancel}
          // onOk={()=> form.submit()}
          destroyOnClose
          footer={null}
          closable={false}
          centered
        >
          <div>
            <section>
              <Alert
                message="提示：可在Nonstd作业中添加非标准作业命令行用于开发，但不建议添加平台已有类型作业命令及MR类型、Script类型作业等标准类型作业命令！"
                type="warning"
                showIcon
                closable
              />
              <ScriptJobModal cRef={childRef} onCancel={onCancel} />
            </section>
          </div>
          <div style={{ position: 'absolute', top: '9px', right: '47px' }}>
            <DevButton onClick={commandPreview}>命令预览</DevButton>
            <DevButton onClick={onCancel} style={{ marginLeft: '10px' }}>
              取消
            </DevButton>
            <DevButton
              onClick={save}
              type="primary"
              style={{ marginLeft: '10px' }}
              loading={dataLoading || dataLoadingUpdate}
              disabled={nonstdJobModelData?.data?.type === 'preview'}
            >
              确认
            </DevButton>
          </div>
        </SqlModal>
      )}
    </div>
  );
};

export default connect(
  ({
    sqlJobModel,
    fileListModel,
    loading,
  }: {
    sqlJobModel: any;
    fileListModel: any;
    loading: { effects: Record<string, boolean> };
  }) => ({
    dataLoading: loading.effects['sqlJobModel/saveJob'],
    dataLoadingUpdate: loading.effects['sqlJobModel/editJob'],
    nonstdJobModelData: sqlJobModel.nonstdJobModelData,
    tabKey: fileListModel.tabKey,
  }),
)(SqlJobAdd);
