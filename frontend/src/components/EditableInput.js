import React, { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import IconButton from '@mui/material/IconButton';
import { TextField } from '@mui/material';

export default function EditableInput({ initialValue, preventTab, label, setValue, multiline }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newValue, setNewValue] = useState(initialValue);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setNewValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);

    if (setValue && initialValue != newValue) {
      setValue(newValue);
    }
  };

  const handleKeyEnter = (e) => {
    if (e.key === 'Enter' && !multiline) {
      handleBlur();
    }
  }

  return (
    <div className='-mb-1'>
      {/*<input className="p-2 border-[#2dacdf] border-y-4 " type="text"/>*/}
      {isEditing ? (
        <TextField
          fullWidth
          label={label}
          variant="standard"
          value={newValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyEnter}
          autoFocus
          tabIndex={preventTab ? -1 : 0}
          spellCheck={false}
          multiline={multiline}
          sx={{
            "& label.Mui-focused": {
              color: "#2dacdf"
            },
            "& .MuiInput-underline:after": {
              borderBottomColor: "#2dacdf"
            }
          }}
        />
      ) : (
        <div>
          <span className="mr-2 font-semibold text-[#2dacdf]">{label}</span> <span className="mr-2 break-normal text-wrap">{newValue}</span>
          <IconButton sx={{ color: '#2dacdf', mb: .5 }} onClick={handleEditClick} tabIndex={preventTab ? -1 : 0} aria-label="edit" size="small" >
            <EditIcon fontSize="inherit" />
          </IconButton>
        </div>
      )}
    </div>
  );
}
