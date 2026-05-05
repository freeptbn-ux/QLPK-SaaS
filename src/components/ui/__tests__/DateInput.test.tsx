import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateInput from '../DateInput';
import { describe, it, expect, vi } from 'vitest';

describe('DateInput Component', () => {
  it('renders three input fields with DD, MM, YYYY placeholders', () => {
    render(<DateInput value="" onChange={() => {}} />);
    expect(screen.getByPlaceholderText('DD')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('MM')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('YYYY')).toBeInTheDocument();
  });

  it('auto-jumps to month when day is filled', async () => {
    const user = userEvent.setup();
    render(<DateInput value="" onChange={() => {}} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    
    await user.type(dayInput, '15');
    expect(monthInput).toHaveFocus();
  });

  it('auto-jumps to year when month is filled', async () => {
    const user = userEvent.setup();
    render(<DateInput value="15//" onChange={() => {}} />);
    
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');
    
    await user.type(monthInput, '06');
    expect(yearInput).toHaveFocus();
  });

  it('back-jumps when backspace is pressed on empty month', async () => {
    const user = userEvent.setup();
    render(<DateInput value="15//" onChange={() => {}} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    const monthInput = screen.getByPlaceholderText('MM');
    
    monthInput.focus();
    await user.keyboard('{Backspace}');
    expect(dayInput).toHaveFocus();
  });

  it('calls onChange with correct format when inputting', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<DateInput value="" onChange={onChange} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    await user.type(dayInput, '15');
    
    // Check the last call to onChange
    expect(onChange).toHaveBeenLastCalledWith('15//');
  });

  it('handles paste of full date DD/MM/YYYY', async () => {
    const onChange = vi.fn();
    render(<DateInput value="" onChange={onChange} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    
    const pasteEvent = {
      clipboardData: {
        getData: (format: string) => format === 'text' ? '20/12/1995' : '',
      },
      preventDefault: vi.fn(),
    };
    
    fireEvent.paste(dayInput, pasteEvent);
    
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1995')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('20/12/1995');
  });

  it('handles paste of full date DDMMYYYY', async () => {
    const onChange = vi.fn();
    render(<DateInput value="" onChange={onChange} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    
    const pasteEvent = {
      clipboardData: {
        getData: (format: string) => format === 'text' ? '25122000' : '',
      },
      preventDefault: vi.fn(),
    };
    
    fireEvent.paste(dayInput, pasteEvent);
    
    expect(screen.getByDisplayValue('25')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
    expect(onChange).toHaveBeenCalledWith('25/12/2000');
  });

  it('only allows numeric input', async () => {
    const user = userEvent.setup();
    render(<DateInput value="" onChange={() => {}} />);
    
    const dayInput = screen.getByPlaceholderText('DD') as HTMLInputElement;
    await user.type(dayInput, 'ab12');
    
    expect(dayInput.value).toBe('12');
  });

  it('keeps focus on day input when clicked, even if fully filled', async () => {
    const user = userEvent.setup();
    render(<DateInput value="15/08/1990" onChange={() => {}} />);
    
    const dayInput = screen.getByPlaceholderText('DD');
    const yearInput = screen.getByPlaceholderText('YYYY');
    
    await user.click(dayInput);
    expect(dayInput).toHaveFocus();
    expect(yearInput).not.toHaveFocus();
  });

  it('keeps focus on month input when clicked, even if fully filled', async () => {
    const user = userEvent.setup();
    render(<DateInput value="15/08/1990" onChange={() => {}} />);
    
    const monthInput = screen.getByPlaceholderText('MM');
    const yearInput = screen.getByPlaceholderText('YYYY');
    
    await user.click(monthInput);
    expect(monthInput).toHaveFocus();
    expect(yearInput).not.toHaveFocus();
  });

  it('jumps to year input when clicking on separator and day/month are filled', async () => {
    const user = userEvent.setup();
    render(<DateInput value="15/08/1990" onChange={() => {}} />);
    
    const yearInput = screen.getByPlaceholderText('YYYY');
    
    // Find the separator (/)
    const separators = screen.getAllByText('/');
    await user.click(separators[0]);
    
    expect(yearInput).toHaveFocus();
  });
});
