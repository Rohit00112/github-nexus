"use client";

import { FC, useState, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Radio, RadioGroup, Card, CardBody, Button, Divider, Switch } from '@nextui-org/react';

const AppearanceSettings: FC = () => {
  const { theme, setTheme } = useTheme();
  const [fontSize, setFontSize] = useState('medium');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [codeTheme, setCodeTheme] = useState('github');

  // Load saved preferences from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFontSize = localStorage.getItem('github-nexus-font-size');
      const savedReducedMotion = localStorage.getItem('github-nexus-reduced-motion');
      const savedHighContrast = localStorage.getItem('github-nexus-high-contrast');
      const savedCodeTheme = localStorage.getItem('github-nexus-code-theme');

      if (savedFontSize) setFontSize(savedFontSize);
      if (savedReducedMotion) setReducedMotion(savedReducedMotion === 'true');
      if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
      if (savedCodeTheme) setCodeTheme(savedCodeTheme);
    }
  }, []);

  // Save preferences to localStorage when they change
  useEffect(() => {
    localStorage.setItem('github-nexus-font-size', fontSize);
    localStorage.setItem('github-nexus-reduced-motion', String(reducedMotion));
    localStorage.setItem('github-nexus-high-contrast', String(highContrast));
    localStorage.setItem('github-nexus-code-theme', codeTheme);

    // Apply font size to document
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'medium' ? '16px' : '18px';

    // Apply reduced motion
    if (reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [fontSize, reducedMotion, highContrast, codeTheme]);

  const handleThemeChange = (value: string) => {
    setTheme(value as 'light' | 'dark');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Customize how GitHub Nexus looks and feels
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              isPressable 
              isHoverable
              className={`border-2 ${theme === 'light' ? 'border-blue-500' : 'border-transparent'}`}
              onPress={() => handleThemeChange('light')}
            >
              <CardBody className="p-4">
                <div className="bg-white border border-gray-200 rounded-md p-3 mb-3">
                  <div className="h-2 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-2 w-16 bg-gray-300 rounded"></div>
                </div>
                <p className="text-center font-medium">Light</p>
              </CardBody>
            </Card>

            <Card 
              isPressable 
              isHoverable
              className={`border-2 ${theme === 'dark' ? 'border-blue-500' : 'border-transparent'}`}
              onPress={() => handleThemeChange('dark')}
            >
              <CardBody className="p-4">
                <div className="bg-gray-900 border border-gray-700 rounded-md p-3 mb-3">
                  <div className="h-2 w-24 bg-gray-700 rounded mb-2"></div>
                  <div className="h-2 w-16 bg-gray-700 rounded"></div>
                </div>
                <p className="text-center font-medium">Dark</p>
              </CardBody>
            </Card>
          </div>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Text Size</h3>
          <RadioGroup
            value={fontSize}
            onValueChange={setFontSize}
            orientation="horizontal"
          >
            <Radio value="small">Small</Radio>
            <Radio value="medium">Medium</Radio>
            <Radio value="large">Large</Radio>
          </RadioGroup>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Code Theme</h3>
          <RadioGroup
            value={codeTheme}
            onValueChange={setCodeTheme}
            orientation="horizontal"
          >
            <Radio value="github">GitHub</Radio>
            <Radio value="vscode">VS Code</Radio>
            <Radio value="monokai">Monokai</Radio>
            <Radio value="dracula">Dracula</Radio>
          </RadioGroup>
        </div>

        <Divider />

        <div>
          <h3 className="text-lg font-medium mb-4">Accessibility</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Reduced Motion</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Minimize animations throughout the interface
                </p>
              </div>
              <Switch
                isSelected={reducedMotion}
                onValueChange={setReducedMotion}
              />
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">High Contrast</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Increase contrast for better readability
                </p>
              </div>
              <Switch
                isSelected={highContrast}
                onValueChange={setHighContrast}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;
