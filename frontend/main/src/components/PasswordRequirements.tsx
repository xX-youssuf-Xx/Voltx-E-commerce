import React from 'react';

interface PasswordRequirementsProps {
  password: string;
  showRequirements: boolean;
}

const PasswordRequirements: React.FC<PasswordRequirementsProps> = ({ password, showRequirements }) => {
  if (!showRequirements || !password) return null;

  const requirements = [
    {
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      label: 'One number',
      met: /\d/.test(password),
    },
  ];

  return (
    <div className="mt-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
      <p className="text-xs text-gray-600 mb-2 font-medium">Password Requirements:</p>
      <ul className="space-y-1">
        {requirements.map((req, index) => (
          <li key={index} className="flex items-center gap-2">
            <span className={`text-xs ${req.met ? 'text-green-500' : 'text-gray-400'}`}>
              {req.met ? '✓' : '○'}
            </span>
            <span className={`text-xs ${req.met ? 'text-green-700' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PasswordRequirements; 