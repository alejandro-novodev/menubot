/**
 * @jest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { ChatBubble } from '@/components/ChatBubble';

describe('ChatBubble', () => {
  it('renders user message content', () => {
    render(<ChatBubble message="Hola, ¿qué platos tienen?" role="user" />);
    expect(screen.getByText('Hola, ¿qué platos tienen?')).toBeInTheDocument();
  });

  it('renders assistant message content', () => {
    render(<ChatBubble message="¡Hola! Tenemos Karaage y Ramen." role="assistant" />);
    expect(screen.getByText('¡Hola! Tenemos Karaage y Ramen.')).toBeInTheDocument();
  });

  it('applies purple styling for user messages', () => {
    const { container } = render(<ChatBubble message="test" role="user" />);
    const bubble = container.querySelector('.from-purple-600');
    expect(bubble).not.toBeNull();
  });

  it('applies gray styling for assistant messages', () => {
    const { container } = render(<ChatBubble message="test" role="assistant" />);
    const bubble = container.querySelector('.bg-gray-800');
    expect(bubble).not.toBeNull();
  });

  it('aligns user messages to the right', () => {
    const { container } = render(<ChatBubble message="test" role="user" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex-row-reverse');
  });

  it('aligns assistant messages to the left', () => {
    const { container } = render(<ChatBubble message="test" role="assistant" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).not.toContain('flex-row-reverse');
  });

  it('renders multiline messages correctly', () => {
    const multiline = 'Primera línea\nSegunda línea';
    const { container } = render(<ChatBubble message={multiline} role="assistant" />);
    expect(container.textContent).toContain('Primera línea');
    expect(container.textContent).toContain('Segunda línea');
  });
});
