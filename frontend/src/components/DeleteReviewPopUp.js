export default function DeleteReviewPopup({ onDelete, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-slate-900 rounded-lg shadow-lg p-6 w-80 text-center">
        <h3 className="text-lg font-semibold text-white text-wrap">Confirm Deletion</h3>
        <p className="text-white mt-2 break-normal">In order to move a reviewed TV Show to another list, you need to delete your review. <br /> Are you sure you want to do that?</p>
        <div className="flex justify-between mt-6">
          <button
            onClick={onDelete}
            className="bg-[#d32f2f] text-white px-4 py-2 rounded hover:bg-[#e57373]"
          >
            Yes, delete
          </button>
          <button
            onClick={onCancel}
            className="bg-[#5700a2] text-white px-4 py-2 rounded hover:bg-[#7832b4]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
