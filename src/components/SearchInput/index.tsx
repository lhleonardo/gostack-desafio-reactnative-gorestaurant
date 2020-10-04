import React, { useState, useCallback } from 'react';

import { TextInputProps } from 'react-native';

import { Container, TextInput, Icon } from './styles';

interface InputProps extends TextInputProps {
  name?: string;

  onFocusEnter(): void;
  onFocusExit(): void;
}

const SearchInput: React.FC<InputProps> = ({
  value = '',
  onFocusEnter,
  onFocusExit,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isFilled, setIsFilled] = useState(false);

  const handleInputFocus = useCallback(() => {
    setIsFocused(true);

    if (onFocusEnter) {
      onFocusEnter();
    }
  }, [onFocusEnter]);

  const handleInputBlur = useCallback(() => {
    setIsFocused(false);

    setIsFilled(!!value);

    onFocusExit();
  }, [value, onFocusExit]);

  return (
    <Container isFocused={isFocused}>
      <Icon
        name="search"
        size={20}
        color={isFocused || isFilled ? '#C72828' : '#B7B7CC'}
      />

      <TextInput
        placeholderTextColor="#B7B7CC"
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        value={value}
        testID="search-input"
        {...rest}
      />
    </Container>
  );
};

export default SearchInput;
