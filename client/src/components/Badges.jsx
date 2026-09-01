import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase().replace(/\s+/g, '');
  return <span className={`badge badge-${normalized}`}>{status || 'Pending'}</span>;
};

export const PriorityBadge = ({ priority }) => {
  const normalized = (priority || 'Medium').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{priority || 'Medium'}</span>;
};

export const RoleBadge = ({ role }) => {
  const normalized = (role || 'citizen').toLowerCase();
  return <span className={`badge badge-${normalized}`}>{role || 'Citizen'}</span>;
};
