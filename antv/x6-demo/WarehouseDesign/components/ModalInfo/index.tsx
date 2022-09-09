import { connect } from 'dva';
import Modal from '@/components/DevModal';

const ModalInfo: React.FC<any> = (props) => {
  const { visible, cancel, title, infoData } = props;

  const onCancel = (flag?: boolean) => {
    cancel(flag);
  };

  return (
    <Modal
      visible={visible}
      forceRender
      title={title}
      width="550px"
      onCancel={onCancel}
      destroyOnClose
      footer={null}
      centered
    >
      <div
        style={{ marginBottom: '20px' }}
        dangerouslySetInnerHTML={{ __html: infoData?.replaceAll(/\n/g, '<br/>') || '' }}
      ></div>
    </Modal>
  );
};

export default connect()(ModalInfo);
